import { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/components/useColorScheme';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { MOCK_ATHLETES, MOCK_RECOVERY_RESPONSES, MOCK_LOAD_RESPONSES, getRecoveryColor, getRecoveryLabel } from '@/constants/MockData';
import { useMockData, Question } from '@/constants/MockContext';
import {
  MOCK_DAILY_LOADS,
  MOCK_DAILY_RECOVERY,
  MOCK_ACWR,
  filterByPeriod,
  filterByDateRange,
  filterByAthlete,
  sumLoadsByDate,
  avgRecoveryByDate,
  getUniqueDates,
  movingAverage,
  getAcwrZone,
  DailyRecovery,
  DailyLoad,
} from '@/constants/MockAnalytics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 64;

type MainTab = 'charts' | 'responses' | 'config';
type MetricTab = 'load' | 'acwr' | 'recovery';

// Period presets for the dropdown
const PERIOD_OPTIONS = [
  { key: '7', label: '7 dias' },
  { key: '14', label: '14 dias' },
  { key: '30', label: '30 dias' },
  { key: '60', label: '60 dias' },
  { key: '90', label: '90 dias' },
  { key: 'custom', label: 'Personalizado' },
];

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [mainTab, setMainTab] = useState<MainTab>('charts');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
      {/* Main navigation */}
      <View style={[styles.mainTabRow, { backgroundColor: colors.card }]}>
        {([
          { key: 'charts', label: 'Gráficos', icon: 'bar-chart' as const },
          { key: 'responses', label: 'Respostas', icon: 'list' as const },
          { key: 'config', label: 'Perguntas', icon: 'settings' as const },
        ] as { key: MainTab; label: string; icon: 'bar-chart' | 'list' | 'settings' }[]).map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.mainTab, mainTab === t.key && { backgroundColor: colors.tint }]}
            onPress={() => setMainTab(t.key)}>
            <Ionicons name={t.icon} size={16} color={mainTab === t.key ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.mainTabText, { color: mainTab === t.key ? '#FFFFFF' : colors.textSecondary }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mainTab === 'charts' && <ChartsSection colors={colors} />}
      {mainTab === 'responses' && <ResponsesSection colors={colors} />}
      {mainTab === 'config' && <ConfigSection colors={colors} />}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

/* ══════════════════════════════════════════════
   DROPDOWN COMPONENT (inline, compact)
   ══════════════════════════════════════════════ */
function Dropdown({ colors, label, options, value, onChange, flex }: {
  colors: typeof Colors.dark;
  label: string;
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
  flex?: number;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.key === value)?.label || label;

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }, flex != null && { flex }]}
        onPress={() => setOpen(true)}>
        <Text style={[styles.dropdownText, { color: colors.text }]} numberOfLines={1}>{selectedLabel}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, value === item.key && { backgroundColor: colors.tint + '22' }]}
                  onPress={() => { onChange(item.key); setOpen(false); }}>
                  <Text style={[styles.modalOptionText, { color: value === item.key ? colors.tint : colors.text }]}>
                    {item.label}
                  </Text>
                  {value === item.key && <Ionicons name="checkmark" size={20} color={colors.tint} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

/* ══════════════════════════════════════════════
   DATE RANGE PICKER (for "Personalizado")
   ══════════════════════════════════════════════ */
function formatInputDate(d: string) {
  // "2026-02-15" → "15/02/2026"
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function parseBrDate(s: string): string | null {
  // "15/02/2026" → "2026-02-15"
  const parts = s.replace(/\D/g, '');
  if (parts.length !== 8) return null;
  const day = parts.slice(0, 2);
  const month = parts.slice(2, 4);
  const year = parts.slice(4, 8);
  const d = new Date(`${year}-${month}-${day}T12:00:00`);
  if (isNaN(d.getTime())) return null;
  return `${year}-${month}-${day}`;
}

function DateRangePicker({ colors, startDate, endDate, onApply, onCancel }: {
  colors: typeof Colors.dark;
  startDate: string;
  endDate: string;
  onApply: (start: string, end: string) => void;
  onCancel: () => void;
}) {
  const [start, setStart] = useState(formatInputDate(startDate));
  const [end, setEnd] = useState(formatInputDate(endDate));

  const handleApply = () => {
    const s = parseBrDate(start);
    const e = parseBrDate(end);
    if (!s || !e) {
      Alert.alert('Data inválida', 'Use o formato DD/MM/AAAA');
      return;
    }
    if (s > e) {
      Alert.alert('Data inválida', 'Data inicial deve ser anterior à final');
      return;
    }
    onApply(s, e);
  };

  return (
    <Card style={{ backgroundColor: colors.card }}>
      <Text style={[styles.formTitle, { color: colors.text }]}>Período personalizado</Text>
      <View style={styles.dateRangeRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.dateRangeLabel, { color: colors.textSecondary }]}>Início</Text>
          <TextInput
            style={[styles.dateRangeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={colors.textSecondary}
            value={start}
            onChangeText={setStart}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.dateRangeLabel, { color: colors.textSecondary }]}>Fim</Text>
          <TextInput
            style={[styles.dateRangeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={colors.textSecondary}
            value={end}
            onChangeText={setEnd}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
      </View>
      <View style={styles.dateRangeButtons}>
        <TouchableOpacity style={[styles.dateRangeCancel, { borderColor: colors.border }]} onPress={onCancel}>
          <Text style={[styles.dateRangeCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.dateRangeApply, { backgroundColor: colors.tint }]} onPress={handleApply}>
          <Text style={styles.dateRangeApplyText}>Aplicar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

/* ══════════════════════════════════════════════
   PERIOD HOOK — encapsulates period state + filtering
   ══════════════════════════════════════════════ */
function usePeriodFilter() {
  const [periodKey, setPeriodKey] = useState('7');
  const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handlePeriodChange = (key: string) => {
    setPeriodKey(key);
    if (key === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      setCustomRange(null);
    }
  };

  const handleCustomApply = (start: string, end: string) => {
    setCustomRange({ start, end });
    setShowCustomPicker(false);
  };

  const filterData = <T extends { date: string }>(data: T[]): T[] => {
    if (periodKey === 'custom' && customRange) {
      return filterByDateRange(data, customRange.start, customRange.end);
    }
    return filterByPeriod(data, parseInt(periodKey, 10));
  };

  const periodLabel = periodKey === 'custom' && customRange
    ? `${formatInputDate(customRange.start)} – ${formatInputDate(customRange.end)}`
    : null;

  return { periodKey, setPeriodKey: handlePeriodChange, showCustomPicker, setShowCustomPicker, customRange, handleCustomApply, filterData, periodLabel };
}

const ATHLETE_OPTIONS = [
  { key: '__all__', label: 'Todos os atletas' },
  ...MOCK_ATHLETES.map((a) => ({ key: a.id, label: a.name })),
];

/* ══════════════════════════════════════════════
   CHARTS SECTION
   ══════════════════════════════════════════════ */
function ChartsSection({ colors }: { colors: typeof Colors.dark }) {
  const [metricTab, setMetricTab] = useState<MetricTab>('load');
  const [selectedAthlete, setSelectedAthlete] = useState<string>('__all__');
  const period = usePeriodFilter();

  const athleteId = selectedAthlete === '__all__' ? null : selectedAthlete;

  return (
    <>
      {/* Athlete + Period on same row */}
      <View style={styles.filterRow}>
        <Dropdown
          colors={colors}
          label="Atleta"
          options={ATHLETE_OPTIONS}
          value={selectedAthlete}
          onChange={setSelectedAthlete}
          flex={1}
        />
        <Dropdown
          colors={colors}
          label="Período"
          options={PERIOD_OPTIONS}
          value={period.periodKey}
          onChange={period.setPeriodKey}
          flex={1}
        />
      </View>

      {/* Custom date range picker */}
      {period.showCustomPicker && (
        <DateRangePicker
          colors={colors}
          startDate={period.customRange?.start || new Date().toISOString().split('T')[0]}
          endDate={period.customRange?.end || new Date().toISOString().split('T')[0]}
          onApply={period.handleCustomApply}
          onCancel={() => { period.setPeriodKey('7'); }}
        />
      )}

      {/* Show active custom range label */}
      {period.periodLabel && (
        <Text style={[styles.customRangeLabel, { color: colors.textSecondary }]}>{period.periodLabel}</Text>
      )}

      {/* Metric Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
        {([
          { key: 'load', label: 'Intensidade' },
          { key: 'acwr', label: 'Risco Lesão' },
          { key: 'recovery', label: 'Recuperação' },
        ] as { key: MetricTab; label: string }[]).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, metricTab === tab.key && { backgroundColor: colors.tint }]}
            onPress={() => setMetricTab(tab.key)}>
            <Text style={[styles.tabText, { color: metricTab === tab.key ? '#FFFFFF' : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {metricTab === 'load' && <LoadTab colors={colors} filterData={period.filterData} athleteId={athleteId} />}
      {metricTab === 'acwr' && <AcwrTab colors={colors} filterData={period.filterData} athleteId={athleteId} />}
      {metricTab === 'recovery' && <RecoveryTab colors={colors} filterData={period.filterData} athleteId={athleteId} />}

      {/* Team Heatmap */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Equipe — Última Semana</Text>
      <TeamHeatmap colors={colors} />
    </>
  );
}

/* ══════════════════════════════════════════════
   RESPONSES SECTION (with date + athlete selectors)
   ══════════════════════════════════════════════ */
function ResponsesSection({ colors }: { colors: typeof Colors.dark }) {
  const allDates = getUniqueDates(MOCK_DAILY_RECOVERY);
  const [selectedDate, setSelectedDate] = useState(allDates[allDates.length - 1] || '');
  const [selectedAthlete, setSelectedAthlete] = useState<string>('__all__');

  const athleteId = selectedAthlete === '__all__' ? null : selectedAthlete;

  // Filter recovery and load data for the selected date
  const dayRecovery = MOCK_DAILY_RECOVERY.filter((r) => r.date === selectedDate);
  const dayLoads = MOCK_DAILY_LOADS.filter((l) => l.date === selectedDate);

  // Apply athlete filter
  const filteredRecovery = athleteId ? dayRecovery.filter((r) => r.athleteId === athleteId) : dayRecovery;
  const filteredLoads = athleteId ? dayLoads.filter((l) => l.athleteId === athleteId) : dayLoads;

  // Athletes who didn't respond on that date
  const recoveryIds = dayRecovery.map((r) => r.athleteId);
  const loadIds = dayLoads.map((l) => l.athleteId);
  const missingRecovery = athleteId
    ? []
    : MOCK_ATHLETES.filter((a) => !recoveryIds.includes(a.id));
  const missingLoad = athleteId
    ? []
    : MOCK_ATHLETES.filter((a) => !loadIds.includes(a.id));

  // Date navigation
  const dateIdx = allDates.indexOf(selectedDate);
  const canPrev = dateIdx > 0;
  const canNext = dateIdx < allDates.length - 1;

  const formatDate = (d: string) => {
    const dt = new Date(d + 'T12:00:00');
    return dt.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  return (
    <>
      {/* Date selector */}
      <View style={[styles.dateSelectorRow, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          onPress={() => canPrev && setSelectedDate(allDates[dateIdx - 1])}
          style={[styles.dateArrow, !canPrev && { opacity: 0.3 }]}
          disabled={!canPrev}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.dateCenter}>
          <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(selectedDate)}</Text>
          <Text style={[styles.dateSubtext, { color: colors.textSecondary }]}>{selectedDate}</Text>
        </View>
        <TouchableOpacity
          onPress={() => canNext && setSelectedDate(allDates[dateIdx + 1])}
          style={[styles.dateArrow, !canNext && { opacity: 0.3 }]}
          disabled={!canNext}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Athlete dropdown */}
      <Dropdown
        colors={colors}
        label="Selecionar atleta"
        options={ATHLETE_OPTIONS}
        value={selectedAthlete}
        onChange={setSelectedAthlete}
      />

      {/* Pre-training responses */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Pré-Treino</Text>
      {filteredRecovery.length > 0 ? (
        filteredRecovery.map((r) => {
          const athlete = MOCK_ATHLETES.find((a) => a.id === r.athleteId);
          return (
            <Card key={r.athleteId} style={{ backgroundColor: colors.card }}>
              <View style={styles.responseHeader}>
                <Text style={[styles.responseName, { color: colors.text }]}>{athlete?.name || r.athleteId}</Text>
                <Badge label={`${r.total}/25 - ${getRecoveryLabel(r.total)}`} color={getRecoveryColor(r.total)} />
              </View>
              <View style={styles.responseGrid}>
                {[
                  { label: 'Sono', value: r.sleep },
                  { label: 'Dor', value: r.soreness },
                  { label: 'Fadiga', value: r.fatigue },
                  { label: 'Humor', value: r.mood },
                  { label: 'Estresse', value: r.stress },
                ].map((item) => (
                  <View key={item.label} style={styles.responseItem}>
                    <Text style={[styles.responseValue, { color: getRecoveryColor(item.value * 5) }]}>
                      {item.value}
                    </Text>
                    <Text style={[styles.responseLabel, { color: colors.textSecondary }]}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          );
        })
      ) : (
        <Card style={{ backgroundColor: colors.card }}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhuma resposta neste dia</Text>
        </Card>
      )}

      {/* Missing athletes (only when "Todos") */}
      {missingRecovery.length > 0 && (
        <Card style={{ backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: colors.warning }}>
          <Text style={[styles.missingTitle, { color: colors.warning }]}>Não responderam pré-treino</Text>
          {missingRecovery.map((a) => (
            <Text key={a.id} style={[styles.missingName, { color: colors.textSecondary }]}>
              {a.name}
            </Text>
          ))}
        </Card>
      )}

      {/* Post-training responses */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Pós-Treino</Text>
      {filteredLoads.length > 0 ? (
        filteredLoads.map((l) => {
          const athlete = MOCK_ATHLETES.find((a) => a.id === l.athleteId);
          return (
            <Card key={l.athleteId} style={{ backgroundColor: colors.card }}>
              <View style={styles.responseHeader}>
                <Text style={[styles.responseName, { color: colors.text }]}>{athlete?.name || l.athleteId}</Text>
                <Text style={[styles.loadValue, { color: colors.accent }]}>{l.load} pts</Text>
              </View>
              <Text style={[styles.responseLoadDetail, { color: colors.textSecondary }]}>
                Esforço {l.rpe} x {l.duration} min
              </Text>
            </Card>
          );
        })
      ) : (
        <Card style={{ backgroundColor: colors.card }}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhuma resposta neste dia</Text>
        </Card>
      )}

      {/* Missing athletes for post (only when "Todos") */}
      {missingLoad.length > 0 && (
        <Card style={{ backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: colors.warning }}>
          <Text style={[styles.missingTitle, { color: colors.warning }]}>Não responderam pós-treino</Text>
          {missingLoad.map((a) => (
            <Text key={a.id} style={[styles.missingName, { color: colors.textSecondary }]}>
              {a.name}
            </Text>
          ))}
        </Card>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════
   CONFIG SECTION (manage questions)
   ══════════════════════════════════════════════ */
function ConfigSection({ colors }: { colors: typeof Colors.dark }) {
  const {
    preQuestions, postQuestions,
    addPreQuestion, removePreQuestion,
    addPostQuestion, removePostQuestion,
  } = useMockData();

  const [configTab, setConfigTab] = useState<'pre' | 'post'>('pre');
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newLow, setNewLow] = useState('');
  const [newHigh, setNewHigh] = useState('');

  const questions = configTab === 'pre' ? preQuestions : postQuestions;
  const addFn = configTab === 'pre' ? addPreQuestion : addPostQuestion;
  const removeFn = configTab === 'pre' ? removePreQuestion : removePostQuestion;

  const handleAdd = () => {
    if (!newLabel.trim()) {
      Alert.alert('Preencha o nome da pergunta');
      return;
    }
    addFn({ label: newLabel.trim(), low: newLow.trim() || '1', high: newHigh.trim() || '5' });
    setNewLabel('');
    setNewLow('');
    setNewHigh('');
    setAdding(false);
  };

  const handleRemove = (q: Question) => {
    Alert.alert('Remover pergunta?', `"${q.label}"`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removeFn(q.id) },
    ]);
  };

  return (
    <>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Configurar Perguntas</Text>

      {/* Pre/Post toggle */}
      <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.tab, configTab === 'pre' && { backgroundColor: colors.tint }]}
          onPress={() => { setConfigTab('pre'); setAdding(false); }}>
          <Text style={[styles.tabText, { color: configTab === 'pre' ? '#FFFFFF' : colors.textSecondary }]}>
            Pré-Treino
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, configTab === 'post' && { backgroundColor: colors.tint }]}
          onPress={() => { setConfigTab('post'); setAdding(false); }}>
          <Text style={[styles.tabText, { color: configTab === 'post' ? '#FFFFFF' : colors.textSecondary }]}>
            Pós-Treino
          </Text>
        </TouchableOpacity>
      </View>

      {configTab === 'post' && (
        <Card style={{ backgroundColor: colors.card }}>
          <Text style={[styles.configNote, { color: colors.textSecondary }]}>
            Esforço (0-10) e Duração são fixos. Abaixo estão as perguntas extras:
          </Text>
        </Card>
      )}

      {/* Question list */}
      {questions.map((q) => (
        <Card key={q.id} style={{ backgroundColor: colors.card }}>
          <View style={styles.configRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.configQuestion, { color: colors.text }]}>{q.label}</Text>
              <Text style={[styles.configScale, { color: colors.textSecondary }]}>
                1 = {q.low}  ·  5 = {q.high}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleRemove(q)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      {questions.length === 0 && (
        <Card style={{ backgroundColor: colors.card }}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {configTab === 'pre' ? 'Nenhuma pergunta configurada' : 'Nenhuma pergunta extra'}
          </Text>
        </Card>
      )}

      {/* Add question */}
      {!adding ? (
        <TouchableOpacity
          style={[styles.addButton, { borderColor: colors.tint }]}
          onPress={() => setAdding(true)}>
          <Ionicons name="add-circle-outline" size={20} color={colors.tint} />
          <Text style={[styles.addButtonText, { color: colors.tint }]}>Adicionar pergunta</Text>
        </TouchableOpacity>
      ) : (
        <Card style={{ backgroundColor: colors.card }}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Nova pergunta</Text>
          <TextInput
            style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Ex: Hidratação"
            placeholderTextColor={colors.textSecondary}
            value={newLabel}
            onChangeText={setNewLabel}
          />
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.formHint, { color: colors.textSecondary }]}>Valor 1 (pior)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Ex: Muito pouca"
                placeholderTextColor={colors.textSecondary}
                value={newLow}
                onChangeText={setNewLow}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.formHint, { color: colors.textSecondary }]}>Valor 5 (melhor)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Ex: Ótima"
                placeholderTextColor={colors.textSecondary}
                value={newHigh}
                onChangeText={setNewHigh}
              />
            </View>
          </View>
          <View style={styles.formButtons}>
            <TouchableOpacity style={[styles.formCancel, { borderColor: colors.border }]} onPress={() => setAdding(false)}>
              <Text style={[styles.formCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.formSave, { backgroundColor: colors.tint }]} onPress={handleAdd}>
              <Text style={styles.formSaveText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════
   CHART SUB-COMPONENTS
   ══════════════════════════════════════════════ */

type FilterFn = <T extends { date: string }>(data: T[]) => T[];

function LoadTab({ colors, filterData, athleteId }: { colors: typeof Colors.dark; filterData: FilterFn; athleteId: string | null }) {
  const filtered = filterByAthlete(filterData(MOCK_DAILY_LOADS), athleteId);
  const byDate = sumLoadsByDate(filtered);
  const loads = byDate.map((d) => d.load);
  const numDays = byDate.length;

  const barData = byDate.map((d) => ({
    value: d.load,
    label: d.date.slice(8),
    frontColor: colors.accent,
  }));

  const totalWeek = loads.reduce((s, v) => s + v, 0);
  const avgDaily = loads.length > 0 ? Math.round(totalWeek / loads.length) : 0;
  const maxDay = byDate.reduce((best, d) => (d.load > (best?.load || 0) ? d : best), byDate[0]);

  // Dynamic bar sizing
  const barWidth = numDays <= 7 ? 28 : numDays <= 14 ? 18 : numDays <= 30 ? 10 : 6;
  const spacing = numDays <= 7 ? 12 : numDays <= 14 ? 8 : numDays <= 30 ? 4 : 2;

  return (
    <>
      <Card style={{ backgroundColor: colors.card }}>
        <BarChart
          data={barData}
          width={CHART_WIDTH}
          height={180}
          barWidth={barWidth}
          spacing={spacing}
          noOfSections={4}
          barBorderRadius={4}
          yAxisColor="transparent"
          xAxisColor={colors.border}
          yAxisTextStyle={{ color: colors.textSecondary, fontFamily: Fonts.bodyRegular, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.textSecondary, fontFamily: Fonts.bodyRegular, fontSize: 9 }}
          isAnimated
          hideRules
        />
      </Card>
      <View style={styles.cardsRow}>
        <Card style={[styles.miniCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.miniCardValue, { color: colors.accent }]}>{totalWeek}</Text>
          <Text style={[styles.miniCardLabel, { color: colors.textSecondary }]}>Total (pts)</Text>
        </Card>
        <Card style={[styles.miniCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.miniCardValue, { color: colors.tint }]}>{avgDaily}</Text>
          <Text style={[styles.miniCardLabel, { color: colors.textSecondary }]}>Média/dia</Text>
        </Card>
        <Card style={[styles.miniCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.miniCardValue, { color: colors.accent }]}>
            {maxDay ? maxDay.date.slice(5).replace('-', '/') : '-'}
          </Text>
          <Text style={[styles.miniCardLabel, { color: colors.textSecondary }]}>Dia + forte</Text>
        </Card>
      </View>
    </>
  );
}

function AcwrTab({ colors, filterData, athleteId }: { colors: typeof Colors.dark; filterData: FilterFn; athleteId: string | null }) {
  if (!athleteId) {
    const latestPerAthlete = MOCK_ATHLETES.map((a) => {
      const points = MOCK_ACWR.filter((p) => p.athleteId === a.id);
      const latest = points[points.length - 1];
      return { athlete: a, acwr: latest?.acwr || 0 };
    });
    const zones = { ideal: 0, attention: 0, risk: 0 };
    latestPerAthlete.forEach(({ acwr }) => {
      if (acwr >= 0.8 && acwr <= 1.3) zones.ideal++;
      else if (acwr > 1.3 && acwr <= 1.5) zones.attention++;
      else zones.risk++;
    });

    return (
      <>
        <Card style={{ backgroundColor: colors.card }}>
          <Text style={[styles.chartPlaceholder, { color: colors.textSecondary }]}>
            Selecione um atleta para ver o gráfico de risco
          </Text>
          {latestPerAthlete.map(({ athlete, acwr }) => {
            const zone = getAcwrZone(acwr);
            return (
              <View key={athlete.id} style={styles.acwrRow}>
                <Text style={[styles.acwrName, { color: colors.text }]}>{athlete.name.split(' ')[0]}</Text>
                <Text style={[styles.acwrValue, { color: zone.color }]}>{acwr.toFixed(2)}</Text>
                <Badge label={zone.label} color={zone.color} />
              </View>
            );
          })}
        </Card>
        <View style={styles.cardsRow}>
          <Card style={[styles.miniCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.miniCardValue, { color: '#46C696' }]}>{zones.ideal}</Text>
            <Text style={[styles.miniCardLabel, { color: colors.textSecondary }]}>Zona ideal</Text>
          </Card>
          <Card style={[styles.miniCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.miniCardValue, { color: '#F5C542' }]}>{zones.attention}</Text>
            <Text style={[styles.miniCardLabel, { color: colors.textSecondary }]}>Atenção</Text>
          </Card>
          <Card style={[styles.miniCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.miniCardValue, { color: '#E74C3C' }]}>{zones.risk}</Text>
            <Text style={[styles.miniCardLabel, { color: colors.textSecondary }]}>Risco</Text>
          </Card>
        </View>
      </>
    );
  }

  const acwrData = filterData(MOCK_ACWR.filter((p) => p.athleteId === athleteId));
  const lineData = acwrData.map((p) => ({ value: p.acwr, label: p.date.slice(8) }));
  const latest = acwrData[acwrData.length - 1];
  const latestZone = latest ? getAcwrZone(latest.acwr) : null;

  return (
    <>
      <Card style={{ backgroundColor: colors.card }}>
        {lineData.length > 0 ? (
          <LineChart
            data={lineData}
            width={CHART_WIDTH}
            height={180}
            color={colors.tint}
            thickness={2}
            noOfSections={4}
            yAxisColor="transparent"
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.textSecondary, fontFamily: Fonts.bodyRegular, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontFamily: Fonts.bodyRegular, fontSize: 9 }}
            dataPointsColor={colors.tint}
            dataPointsRadius={3}
            isAnimated
            hideRules
            maxValue={2}
            stepValue={0.5}
            areaChart
            startFillColor={colors.tint + '33'}
            endFillColor={colors.tint + '05'}
          />
        ) : (
          <Text style={[styles.chartPlaceholder, { color: colors.textSecondary }]}>Sem dados suficientes</Text>
        )}
        <View style={styles.zoneLegend}>
          <View style={styles.zoneItem}>
            <View style={[styles.zoneDot, { backgroundColor: '#46C696' }]} />
            <Text style={[styles.zoneText, { color: colors.textSecondary }]}>0.8–1.3 Ideal</Text>
          </View>
          <View style={styles.zoneItem}>
            <View style={[styles.zoneDot, { backgroundColor: '#F5C542' }]} />
            <Text style={[styles.zoneText, { color: colors.textSecondary }]}>1.3–1.5 Atenção</Text>
          </View>
          <View style={styles.zoneItem}>
            <View style={[styles.zoneDot, { backgroundColor: '#E74C3C' }]} />
            <Text style={[styles.zoneText, { color: colors.textSecondary }]}>{'>'}1.5 Risco</Text>
          </View>
        </View>
      </Card>
      {latest && latestZone && (
        <Card style={{ backgroundColor: latestZone.color + '22', borderWidth: 1, borderColor: latestZone.color }}>
          <Text style={[styles.resultTitle, { color: latestZone.color }]}>{latestZone.label}</Text>
          <Text style={[styles.resultScore, { color: latestZone.color }]}>{latest.acwr.toFixed(2)}</Text>
        </Card>
      )}
    </>
  );
}

function RecoveryTab({ colors, filterData, athleteId }: { colors: typeof Colors.dark; filterData: FilterFn; athleteId: string | null }) {
  const filtered = filterByAthlete(filterData(MOCK_DAILY_RECOVERY), athleteId);

  if (!athleteId) {
    const byDate = avgRecoveryByDate(filtered);
    const lineData = byDate.map((d) => ({ value: d.avg, label: d.date.slice(8) }));
    const overallAvg = byDate.length > 0
      ? Math.round((byDate.reduce((s, d) => s + d.avg, 0) / byDate.length) * 10) / 10
      : 0;

    return (
      <>
        <Card style={{ backgroundColor: colors.card }}>
          {lineData.length > 0 ? (
            <LineChart
              data={lineData}
              width={CHART_WIDTH}
              height={180}
              color={colors.tint}
              thickness={2}
              noOfSections={5}
              maxValue={25}
              stepValue={5}
              yAxisColor="transparent"
              xAxisColor={colors.border}
              yAxisTextStyle={{ color: colors.textSecondary, fontFamily: Fonts.bodyRegular, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.textSecondary, fontFamily: Fonts.bodyRegular, fontSize: 9 }}
              dataPointsColor={colors.tint}
              dataPointsRadius={3}
              isAnimated
              hideRules
              areaChart
              startFillColor={colors.tint + '33'}
              endFillColor={colors.tint + '05'}
            />
          ) : (
            <Text style={[styles.chartPlaceholder, { color: colors.textSecondary }]}>Sem dados</Text>
          )}
        </Card>
        <Card style={[styles.miniCard, { backgroundColor: colors.card, alignSelf: 'flex-start' }]}>
          <Text style={[styles.miniCardValue, { color: colors.tint }]}>{overallAvg}/25</Text>
          <Text style={[styles.miniCardLabel, { color: colors.textSecondary }]}>Média equipe</Text>
        </Card>
      </>
    );
  }

  // Single athlete: show total recovery line
  const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
  const lineData = sorted.map((r) => ({ value: r.total, label: r.date.slice(8) }));

  const dimensions: { key: keyof DailyRecovery; label: string; color: string }[] = [
    { key: 'sleep', label: 'Sono', color: '#3B82F6' },
    { key: 'soreness', label: 'Dor', color: '#E74C3C' },
    { key: 'fatigue', label: 'Fadiga', color: '#F5C542' },
    { key: 'mood', label: 'Humor', color: '#46C696' },
    { key: 'stress', label: 'Estresse', color: '#A855F7' },
  ];

  const avgTotal = sorted.length > 0
    ? Math.round((sorted.reduce((s, r) => s + r.total, 0) / sorted.length) * 10) / 10
    : 0;

  const dimAvgs = dimensions.map((dim) => ({
    label: dim.label,
    color: dim.color,
    avg: sorted.length > 0
      ? Math.round((sorted.reduce((s, r) => s + (r[dim.key] as number), 0) / sorted.length) * 10) / 10
      : 0,
  }));
  const weakest = dimAvgs.reduce((min, d) => (d.avg < min.avg ? d : min), dimAvgs[0]);

  return (
    <>
      <Card style={{ backgroundColor: colors.card }}>
        {lineData.length > 0 ? (
          <LineChart
            data={lineData}
            width={CHART_WIDTH}
            height={180}
            color={colors.tint}
            thickness={2}
            noOfSections={5}
            maxValue={25}
            stepValue={5}
            yAxisColor="transparent"
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.textSecondary, fontFamily: Fonts.bodyRegular, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontFamily: Fonts.bodyRegular, fontSize: 9 }}
            dataPointsColor={colors.tint}
            dataPointsRadius={3}
            isAnimated
            hideRules
            areaChart
            startFillColor={colors.tint + '33'}
            endFillColor={colors.tint + '05'}
          />
        ) : (
          <Text style={[styles.chartPlaceholder, { color: colors.textSecondary }]}>Sem dados</Text>
        )}
      </Card>

      {/* Dimension breakdown */}
      <Card style={{ backgroundColor: colors.card }}>
        <Text style={[styles.configNote, { color: colors.text }]}>Média por dimensão</Text>
        {dimAvgs.map((d) => (
          <View key={d.label} style={styles.dimRow}>
            <View style={[styles.zoneDot, { backgroundColor: d.color }]} />
            <Text style={[styles.dimLabel, { color: colors.text }]}>{d.label}</Text>
            <Text style={[styles.dimValue, { color: d.color }]}>{d.avg}/5</Text>
          </View>
        ))}
      </Card>

      <View style={styles.cardsRow}>
        <Card style={[styles.miniCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.miniCardValue, { color: colors.tint }]}>{avgTotal}/25</Text>
          <Text style={[styles.miniCardLabel, { color: colors.textSecondary }]}>Média geral</Text>
        </Card>
        {weakest && (
          <Card style={[styles.miniCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.miniCardValue, { color: colors.danger }]}>{weakest.label}</Text>
            <Text style={[styles.miniCardLabel, { color: colors.textSecondary }]}>Mais baixo</Text>
          </Card>
        )}
      </View>
    </>
  );
}

function TeamHeatmap({ colors }: { colors: typeof Colors.dark }) {
  const last7 = filterByPeriod(MOCK_DAILY_RECOVERY, 7);
  const dates = [...new Set(last7.map((r) => r.date))].sort().slice(-5);
  const weekdays = dates.map((d) => {
    const day = new Date(d + 'T12:00:00').getDay();
    return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day];
  });

  return (
    <Card style={{ backgroundColor: colors.card }}>
      <View style={styles.heatmapRow}>
        <View style={styles.heatmapName} />
        {weekdays.map((wd, i) => (
          <View key={i} style={styles.heatmapCell}>
            <Text style={[styles.heatmapHeader, { color: colors.textSecondary }]}>{wd}</Text>
          </View>
        ))}
      </View>
      {MOCK_ATHLETES.map((a) => (
        <View key={a.id} style={styles.heatmapRow}>
          <View style={styles.heatmapName}>
            <Text style={[styles.heatmapNameText, { color: colors.text }]}>{a.name.split(' ')[0]}</Text>
          </View>
          {dates.map((date) => {
            const rec = last7.find((r) => r.athleteId === a.id && r.date === date);
            let dotColor = colors.border;
            if (rec) {
              if (rec.total <= 10) dotColor = '#E74C3C';
              else if (rec.total <= 15) dotColor = '#F5C542';
              else if (rec.total <= 20) dotColor = '#46C696';
              else dotColor = '#2D8A5F';
            }
            return (
              <View key={date} style={styles.heatmapCell}>
                <View style={[styles.heatmapDot, { backgroundColor: dotColor }]} />
              </View>
            );
          })}
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 30 },
  /* Main tabs */
  mainTabRow: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 16 },
  mainTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  mainTabText: { fontFamily: Fonts.titleSemiBold, fontSize: 12 },
  /* Dropdown */
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, marginBottom: 12, gap: 6 },
  dropdownText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, flexShrink: 1 },
  modalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', paddingHorizontal: 32 },
  modalContent: { borderRadius: 16, maxHeight: 400, paddingVertical: 8 },
  modalTitle: { fontFamily: Fonts.titleSemiBold, fontSize: 16, paddingHorizontal: 16, paddingVertical: 12 },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  modalOptionText: { fontFamily: Fonts.bodyRegular, fontSize: 15 },
  /* Filter row (athlete + period side by side) */
  filterRow: { flexDirection: 'row', gap: 8 },
  customRangeLabel: { fontFamily: Fonts.bodyRegular, fontSize: 12, textAlign: 'center', marginBottom: 8 },
  /* Date range picker */
  dateRangeRow: { flexDirection: 'row' },
  dateRangeLabel: { fontFamily: Fonts.bodyRegular, fontSize: 11, marginBottom: 4 },
  dateRangeInput: { fontFamily: Fonts.bodyRegular, fontSize: 14, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  dateRangeButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
  dateRangeCancel: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  dateRangeCancelText: { fontFamily: Fonts.bodySemiBold, fontSize: 14 },
  dateRangeApply: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  dateRangeApplyText: { fontFamily: Fonts.titleSemiBold, fontSize: 14, color: '#FFFFFF' },
  /* Date selector (responses) */
  dateSelectorRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 4, marginBottom: 12 },
  dateArrow: { padding: 8 },
  dateCenter: { flex: 1, alignItems: 'center' },
  dateText: { fontFamily: Fonts.titleSemiBold, fontSize: 15 },
  dateSubtext: { fontFamily: Fonts.bodyRegular, fontSize: 11, marginTop: 2 },
  /* Metric tabs */
  tabRow: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabText: { fontFamily: Fonts.titleSemiBold, fontSize: 12 },
  sectionTitle: { fontFamily: Fonts.titleSemiBold, fontSize: 16, marginTop: 20, marginBottom: 10 },
  /* Cards */
  cardsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  miniCard: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  miniCardValue: { fontFamily: Fonts.titleBold, fontSize: 20 },
  miniCardLabel: { fontFamily: Fonts.bodyRegular, fontSize: 11, marginTop: 2 },
  chartPlaceholder: { fontFamily: Fonts.bodyRegular, fontSize: 14, textAlign: 'center', paddingVertical: 12 },
  emptyText: { fontFamily: Fonts.bodyRegular, fontSize: 14, textAlign: 'center', paddingVertical: 8 },
  /* ACWR */
  acwrRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB22' },
  acwrName: { fontFamily: Fonts.bodySemiBold, fontSize: 14, flex: 1 },
  acwrValue: { fontFamily: Fonts.titleSemiBold, fontSize: 14, marginRight: 8 },
  zoneLegend: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 12 },
  zoneItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  zoneText: { fontFamily: Fonts.bodyRegular, fontSize: 10 },
  resultTitle: { fontFamily: Fonts.titleSemiBold, fontSize: 14, textAlign: 'center' },
  resultScore: { fontFamily: Fonts.titleBold, fontSize: 32, textAlign: 'center' },
  /* Heatmap */
  heatmapRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  heatmapName: { width: 60 },
  heatmapNameText: { fontFamily: Fonts.bodySemiBold, fontSize: 12 },
  heatmapCell: { flex: 1, alignItems: 'center' },
  heatmapHeader: { fontFamily: Fonts.bodySemiBold, fontSize: 10 },
  heatmapDot: { width: 20, height: 20, borderRadius: 10 },
  /* Responses */
  responseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  responseName: { fontFamily: Fonts.titleSemiBold, fontSize: 15 },
  responseGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  responseItem: { alignItems: 'center' },
  responseValue: { fontFamily: Fonts.titleBold, fontSize: 22 },
  responseLabel: { fontFamily: Fonts.bodyRegular, fontSize: 10, marginTop: 2 },
  loadValue: { fontFamily: Fonts.titleBold, fontSize: 16 },
  responseLoadDetail: { fontFamily: Fonts.bodyRegular, fontSize: 13 },
  missingTitle: { fontFamily: Fonts.titleSemiBold, fontSize: 14, marginBottom: 6 },
  missingName: { fontFamily: Fonts.bodyRegular, fontSize: 14, marginBottom: 2 },
  /* Dimension breakdown */
  dimRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  dimLabel: { fontFamily: Fonts.bodyRegular, fontSize: 14, flex: 1 },
  dimValue: { fontFamily: Fonts.titleSemiBold, fontSize: 14 },
  /* Config */
  configRow: { flexDirection: 'row', alignItems: 'center' },
  configQuestion: { fontFamily: Fonts.titleSemiBold, fontSize: 14 },
  configScale: { fontFamily: Fonts.bodyRegular, fontSize: 12, marginTop: 2 },
  configNote: { fontFamily: Fonts.bodyRegular, fontSize: 13, marginBottom: 8 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', marginTop: 8 },
  addButtonText: { fontFamily: Fonts.titleSemiBold, fontSize: 14 },
  /* Form */
  formTitle: { fontFamily: Fonts.titleSemiBold, fontSize: 15, marginBottom: 12 },
  formInput: { fontFamily: Fonts.bodyRegular, fontSize: 14, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  formRow: { flexDirection: 'row' },
  formHint: { fontFamily: Fonts.bodyRegular, fontSize: 11, marginBottom: 4 },
  formButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  formCancel: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  formCancelText: { fontFamily: Fonts.bodySemiBold, fontSize: 14 },
  formSave: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  formSaveText: { fontFamily: Fonts.titleSemiBold, fontSize: 14, color: '#FFFFFF' },
});
