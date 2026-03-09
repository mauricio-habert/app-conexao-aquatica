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

import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/components/useColorScheme';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/constants/AuthContext';
import { useMockData, Question } from '@/constants/MockContext';
import { getRecoveryColor, getRecoveryLabel, getRpeColor, MOCK_ATHLETES } from '@/constants/MockData';
import {
  MOCK_DAILY_RECOVERY,
  MOCK_DAILY_LOADS,
  getUniqueDates,
  filterByPeriod,
  filterByDateRange,
  sumLoadsByDate,
  DailyRecovery,
  DailyLoad,
} from '@/constants/MockAnalytics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 64;

const SCALE_COLORS = ['#E74C3C', '#E87A1E', '#F5C542', '#46C696', '#2D8A5F'];

const RPE_LABELS: Record<number, string> = {
  0: 'Nenhum',
  1: 'Muito leve',
  2: 'Leve',
  3: 'Moderado',
  4: 'Moderado+',
  5: 'Forte',
  6: 'Forte+',
  7: 'Muito forte',
  8: 'Muito forte+',
  9: 'Extremo',
  10: 'Máximo',
};

export default function QuestionnairesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  const isCoach = user?.role === 'coach';
  const {
    preQuestions, postQuestions,
    addPreQuestion, removePreQuestion,
    addPostQuestion, removePostQuestion,
  } = useMockData();

  const [activeTab, setActiveTab] = useState<'pre' | 'post' | 'history' | 'performance'>('pre');
  const [preAnswers, setPreAnswers] = useState<Record<string, number>>({});
  const [postAnswers, setPostAnswers] = useState<Record<string, number>>({});
  const [rpe, setRpe] = useState<number | null>(null);
  const [duration, setDuration] = useState(90);

  // Add question form
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newLow, setNewLow] = useState('');
  const [newHigh, setNewHigh] = useState('');

  const preTotal = Object.values(preAnswers).reduce((sum, v) => sum + v, 0);
  const maxPreScore = preQuestions.length * 5;
  const allPreAnswered = Object.keys(preAnswers).length === preQuestions.length;
  const load = rpe !== null ? rpe * duration : null;

  const handlePreSubmit = () => {
    Alert.alert(
      'Recuperação registrada!',
      `Pontuação: ${preTotal}/${maxPreScore} - ${getRecoveryLabel(preTotal)}`,
      [{ text: 'OK' }]
    );
  };

  const handlePostSubmit = () => {
    Alert.alert(
      'Intensidade registrada!',
      `Esforço ${rpe} x ${duration}min = ${load} pontos`,
      [{ text: 'OK' }]
    );
  };

  const handleAddQuestion = () => {
    if (!newLabel.trim()) {
      Alert.alert('Preencha o nome da pergunta');
      return;
    }
    const question = {
      label: newLabel.trim(),
      low: newLow.trim() || '1',
      high: newHigh.trim() || '5',
    };
    if (activeTab === 'pre') {
      addPreQuestion(question);
    } else {
      addPostQuestion(question);
    }
    setNewLabel('');
    setNewLow('');
    setNewHigh('');
    setAdding(false);
  };

  const handleRemoveQuestion = (q: Question) => {
    Alert.alert('Remover pergunta?', `"${q.label}"`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          if (activeTab === 'pre') {
            removePreQuestion(q.id);
            setPreAnswers((prev) => {
              const next = { ...prev };
              delete next[q.id];
              return next;
            });
          } else {
            removePostQuestion(q.id);
            setPostAnswers((prev) => {
              const next = { ...prev };
              delete next[q.id];
              return next;
            });
          }
        },
      },
    ]);
  };

  const currentQuestions = activeTab === 'pre' ? preQuestions : postQuestions;
  const currentAnswers = activeTab === 'pre' ? preAnswers : postAnswers;
  const setCurrentAnswers = activeTab === 'pre' ? setPreAnswers : setPostAnswers;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      {/* Tab Selector */}
      {isCoach ? (
        <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
          {([
            { key: 'pre' as const, label: 'Pré-Treino' },
            { key: 'post' as const, label: 'Pós-Treino' },
          ]).map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && { backgroundColor: colors.tint }]}
              onPress={() => { setActiveTab(t.key); setAdding(false); }}>
              <Text style={[styles.tabText, { color: activeTab === t.key ? '#FFFFFF' : colors.textSecondary }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
          {([
            { key: 'pre' as const, label: 'Pré', icon: 'sunny-outline' as const },
            { key: 'post' as const, label: 'Pós', icon: 'fitness-outline' as const },
            { key: 'history' as const, label: 'Respostas', icon: 'document-text-outline' as const },
            { key: 'performance' as const, label: 'Evolução', icon: 'trending-up-outline' as const },
          ]).map((t) => {
            const isActive = activeTab === t.key;
            const bg = (t.key === 'history' || t.key === 'performance') ? colors.accent : colors.tint;
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabIconBtn, isActive && { backgroundColor: bg }]}
                onPress={() => { setActiveTab(t.key); setAdding(false); }}>
                <Ionicons name={t.icon} size={16} color={isActive ? '#FFFFFF' : colors.textSecondary} />
                <Text style={[styles.tabIconText, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {activeTab === 'performance' ? (
        <MyPerformanceSection colors={colors} />
      ) : activeTab === 'history' ? (
        <MyResponsesSection colors={colors} />
      ) : activeTab === 'pre' ? (
        <>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Como você está se sentindo hoje?
          </Text>

          {/* Pre-training questions */}
          {preQuestions.map((q) => (
            <Card key={q.id} style={{ backgroundColor: colors.card }}>
              <View style={styles.questionHeader}>
                <Text style={[styles.questionLabel, { color: colors.text, flex: 1 }]}>
                  {q.label}
                </Text>
                {isCoach && (
                  <TouchableOpacity
                    onPress={() => handleRemoveQuestion(q)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close-circle" size={22} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.scaleRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() =>
                      setPreAnswers({ ...preAnswers, [q.id]: value })
                    }
                    style={[
                      styles.scaleButton,
                      {
                        backgroundColor:
                          preAnswers[q.id] === value
                            ? SCALE_COLORS[value - 1]
                            : colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.scaleNumber,
                        {
                          color:
                            preAnswers[q.id] === value ? '#FFFFFF' : colors.textSecondary,
                        },
                      ]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.scaleLabels}>
                <Text style={[styles.scaleLabelText, { color: colors.textSecondary }]}>
                  {q.low}
                </Text>
                <Text style={[styles.scaleLabelText, { color: colors.textSecondary }]}>
                  {q.high}
                </Text>
              </View>
            </Card>
          ))}

          {allPreAnswered && preQuestions.length > 0 && (
            <Card
              style={{
                backgroundColor: getRecoveryColor(preTotal) + '22',
                borderWidth: 1,
                borderColor: getRecoveryColor(preTotal),
              }}>
              <Text style={[styles.resultTitle, { color: getRecoveryColor(preTotal) }]}>
                Recuperação: {getRecoveryLabel(preTotal)}
              </Text>
              <Text style={[styles.resultScore, { color: getRecoveryColor(preTotal) }]}>
                {preTotal}/{maxPreScore}
              </Text>
            </Card>
          )}

          {/* Add question (coach) */}
          {isCoach && !adding && (
            <TouchableOpacity
              style={[styles.addQuestionButton, { borderColor: colors.tint }]}
              onPress={() => setAdding(true)}>
              <Ionicons name="add-circle-outline" size={20} color={colors.tint} />
              <Text style={[styles.addQuestionText, { color: colors.tint }]}>
                Adicionar pergunta
              </Text>
            </TouchableOpacity>
          )}

          {isCoach && adding && (
            <AddQuestionForm
              colors={colors}
              newLabel={newLabel}
              setNewLabel={setNewLabel}
              newLow={newLow}
              setNewLow={setNewLow}
              newHigh={newHigh}
              setNewHigh={setNewHigh}
              onSave={handleAddQuestion}
              onCancel={() => setAdding(false)}
            />
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: allPreAnswered && preQuestions.length > 0 ? colors.tint : colors.border,
              },
            ]}
            disabled={!allPreAnswered || preQuestions.length === 0}
            onPress={handlePreSubmit}>
            <Text style={styles.submitText}>Enviar Avaliação</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Como foi o esforço no treino?
          </Text>

          {/* RPE Selection */}
          <Card style={{ backgroundColor: colors.card }}>
            <Text style={[styles.questionLabel, { color: colors.text }]}>
              Nível de esforço
            </Text>
            <View style={styles.rpeGrid}>
              {Array.from({ length: 11 }, (_, i) => i).map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setRpe(value)}
                  style={[
                    styles.rpeButton,
                    {
                      backgroundColor:
                        rpe === value ? getRpeColor(value) : colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.rpeNumber,
                      { color: rpe === value ? '#FFFFFF' : colors.textSecondary },
                    ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {rpe !== null && (
              <Text style={[styles.rpeLabel, { color: getRpeColor(rpe) }]}>
                {RPE_LABELS[rpe]}
              </Text>
            )}
          </Card>

          {/* Duration */}
          <Card style={{ backgroundColor: colors.card }}>
            <Text style={[styles.questionLabel, { color: colors.text }]}>
              Duração do treino
            </Text>
            <View style={styles.durationRow}>
              <TouchableOpacity
                style={[styles.durationBtn, { backgroundColor: colors.border }]}
                onPress={() => setDuration(Math.max(15, duration - 15))}>
                <Text style={[styles.durationBtnText, { color: colors.text }]}>-15</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.durationBtn, { backgroundColor: colors.border }]}
                onPress={() => setDuration(Math.max(5, duration - 5))}>
                <Text style={[styles.durationBtnText, { color: colors.text }]}>-5</Text>
              </TouchableOpacity>
              <View style={styles.durationDisplay}>
                <Text style={[styles.durationValue, { color: colors.accent }]}>
                  {duration}
                </Text>
                <Text style={[styles.durationUnit, { color: colors.textSecondary }]}>
                  min
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.durationBtn, { backgroundColor: colors.border }]}
                onPress={() => setDuration(duration + 5)}>
                <Text style={[styles.durationBtnText, { color: colors.text }]}>+5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.durationBtn, { backgroundColor: colors.border }]}
                onPress={() => setDuration(duration + 15)}>
                <Text style={[styles.durationBtnText, { color: colors.text }]}>+15</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Extra post-training questions */}
          {postQuestions.map((q) => (
            <Card key={q.id} style={{ backgroundColor: colors.card }}>
              <View style={styles.questionHeader}>
                <Text style={[styles.questionLabel, { color: colors.text, flex: 1 }]}>
                  {q.label}
                </Text>
                {isCoach && (
                  <TouchableOpacity
                    onPress={() => handleRemoveQuestion(q)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close-circle" size={22} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.scaleRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() =>
                      setPostAnswers({ ...postAnswers, [q.id]: value })
                    }
                    style={[
                      styles.scaleButton,
                      {
                        backgroundColor:
                          postAnswers[q.id] === value
                            ? SCALE_COLORS[value - 1]
                            : colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.scaleNumber,
                        {
                          color:
                            postAnswers[q.id] === value ? '#FFFFFF' : colors.textSecondary,
                        },
                      ]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.scaleLabels}>
                <Text style={[styles.scaleLabelText, { color: colors.textSecondary }]}>
                  {q.low}
                </Text>
                <Text style={[styles.scaleLabelText, { color: colors.textSecondary }]}>
                  {q.high}
                </Text>
              </View>
            </Card>
          ))}

          {/* Add question (coach) */}
          {isCoach && !adding && (
            <TouchableOpacity
              style={[styles.addQuestionButton, { borderColor: colors.tint }]}
              onPress={() => setAdding(true)}>
              <Ionicons name="add-circle-outline" size={20} color={colors.tint} />
              <Text style={[styles.addQuestionText, { color: colors.tint }]}>
                Adicionar pergunta
              </Text>
            </TouchableOpacity>
          )}

          {isCoach && adding && (
            <AddQuestionForm
              colors={colors}
              newLabel={newLabel}
              setNewLabel={setNewLabel}
              newLow={newLow}
              setNewLow={setNewLow}
              newHigh={newHigh}
              setNewHigh={setNewHigh}
              onSave={handleAddQuestion}
              onCancel={() => setAdding(false)}
            />
          )}

          {/* Load Result */}
          {rpe !== null && (
            <Card
              style={{
                backgroundColor: colors.accent + '22',
                borderWidth: 1,
                borderColor: colors.accent,
              }}>
              <Text style={[styles.resultTitle, { color: colors.accent }]}>
                Intensidade do Treino
              </Text>
              <Text style={[styles.resultScore, { color: colors.accent }]}>
                {load} pontos
              </Text>
              <Text style={[styles.resultDetail, { color: colors.textSecondary }]}>
                Esforço {rpe} x {duration} min
              </Text>
            </Card>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: rpe !== null ? colors.tint : colors.border,
              },
            ]}
            disabled={rpe === null}
            onPress={handlePostSubmit}>
            <Text style={styles.submitText}>Enviar Intensidade</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

/* ── My Performance (Athlete only) ── */
const PERIOD_OPTIONS = [
  { key: '7', label: '7 dias' },
  { key: '14', label: '14 dias' },
  { key: '30', label: '30 dias' },
  { key: '60', label: '60 dias' },
  { key: '90', label: '90 dias' },
  { key: 'custom', label: 'Personalizado' },
];

function formatInputDate(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function parseBrDate(s: string): string | null {
  const parts = s.replace(/\D/g, '');
  if (parts.length !== 8) return null;
  const day = parts.slice(0, 2);
  const month = parts.slice(2, 4);
  const year = parts.slice(4, 8);
  const d = new Date(`${year}-${month}-${day}T12:00:00`);
  if (isNaN(d.getTime())) return null;
  return `${year}-${month}-${day}`;
}

function PerfPeriodDropdown({ colors, value, onChange }: {
  colors: typeof Colors.dark; value: string; onChange: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = PERIOD_OPTIONS.find((o) => o.key === value)?.label || 'Período';
  return (
    <>
      <TouchableOpacity
        style={[styles.perfPeriodDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setOpen(true)}>
        <Ionicons name="calendar-outline" size={16} color={colors.accent} />
        <Text style={[styles.perfPeriodText, { color: colors.text }]}>{selectedLabel}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.perfModalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.perfModalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.perfModalTitle, { color: colors.text }]}>Período</Text>
            <FlatList
              data={PERIOD_OPTIONS}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.perfModalOption, value === item.key && { backgroundColor: colors.accent + '22' }]}
                  onPress={() => { onChange(item.key); setOpen(false); }}>
                  <Text style={[styles.perfModalOptionText, { color: value === item.key ? colors.accent : colors.text }]}>
                    {item.label}
                  </Text>
                  {value === item.key && <Ionicons name="checkmark" size={20} color={colors.accent} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

function PerfDateRangePicker({ colors, startDate, endDate, onApply, onCancel }: {
  colors: typeof Colors.dark; startDate: string; endDate: string;
  onApply: (start: string, end: string) => void; onCancel: () => void;
}) {
  const [start, setStart] = useState(formatInputDate(startDate));
  const [end, setEnd] = useState(formatInputDate(endDate));
  const handleApply = () => {
    const s = parseBrDate(start);
    const e = parseBrDate(end);
    if (!s || !e) { Alert.alert('Data inválida', 'Use DD/MM/AAAA'); return; }
    if (s > e) { Alert.alert('Data inválida', 'Início deve ser antes do fim'); return; }
    onApply(s, e);
  };
  return (
    <Card style={{ backgroundColor: colors.card }}>
      <Text style={[styles.perfFormTitle, { color: colors.text }]}>Período personalizado</Text>
      <View style={styles.perfDateRangeRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.perfDateRangeLabel, { color: colors.textSecondary }]}>Início</Text>
          <TextInput
            style={[styles.perfDateRangeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="DD/MM/AAAA" placeholderTextColor={colors.textSecondary}
            value={start} onChangeText={setStart} keyboardType="numeric" maxLength={10}
          />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.perfDateRangeLabel, { color: colors.textSecondary }]}>Fim</Text>
          <TextInput
            style={[styles.perfDateRangeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="DD/MM/AAAA" placeholderTextColor={colors.textSecondary}
            value={end} onChangeText={setEnd} keyboardType="numeric" maxLength={10}
          />
        </View>
      </View>
      <View style={styles.perfDateRangeButtons}>
        <TouchableOpacity style={[styles.perfDateRangeCancel, { borderColor: colors.border }]} onPress={onCancel}>
          <Text style={[styles.perfDateRangeCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.perfDateRangeApply, { backgroundColor: colors.accent }]} onPress={handleApply}>
          <Text style={styles.perfDateRangeApplyText}>Aplicar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

function MyPerformanceSection({ colors }: { colors: typeof Colors.dark }) {
  const [perfTab, setPerfTab] = useState<'load' | 'recovery'>('load');
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

  const filterData = <T extends { date: string }>(data: T[]): T[] => {
    if (periodKey === 'custom' && customRange) {
      return filterByDateRange(data, customRange.start, customRange.end);
    }
    return filterByPeriod(data, parseInt(periodKey, 10));
  };

  const myLoads = filterData(MOCK_DAILY_LOADS.filter((l) => l.athleteId === MY_ATHLETE_ID));
  const myRecovery = filterData(MOCK_DAILY_RECOVERY.filter((r) => r.athleteId === MY_ATHLETE_ID));

  const customLabel = periodKey === 'custom' && customRange
    ? `${formatInputDate(customRange.start)} – ${formatInputDate(customRange.end)}`
    : null;

  return (
    <>
      <PerfPeriodDropdown colors={colors} value={periodKey} onChange={handlePeriodChange} />

      {showCustomPicker && (
        <PerfDateRangePicker
          colors={colors}
          startDate={customRange?.start || new Date().toISOString().split('T')[0]}
          endDate={customRange?.end || new Date().toISOString().split('T')[0]}
          onApply={(s, e) => { setCustomRange({ start: s, end: e }); setShowCustomPicker(false); }}
          onCancel={() => handlePeriodChange('7')}
        />
      )}

      {customLabel && (
        <Text style={[styles.perfCustomLabel, { color: colors.textSecondary }]}>{customLabel}</Text>
      )}

      {/* Sub-tabs: Intensidade / Recuperação */}
      <View style={[styles.perfSubTabRow, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.perfSubTab, perfTab === 'load' && { backgroundColor: colors.accent }]}
          onPress={() => setPerfTab('load')}>
          <Text style={[styles.perfSubTabText, { color: perfTab === 'load' ? '#FFFFFF' : colors.textSecondary }]}>
            Intensidade
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.perfSubTab, perfTab === 'recovery' && { backgroundColor: colors.accent }]}
          onPress={() => setPerfTab('recovery')}>
          <Text style={[styles.perfSubTabText, { color: perfTab === 'recovery' ? '#FFFFFF' : colors.textSecondary }]}>
            Recuperação
          </Text>
        </TouchableOpacity>
      </View>

      {perfTab === 'load' ? (
        <PerfLoadSection colors={colors} loads={myLoads} />
      ) : (
        <PerfRecoverySection colors={colors} recovery={myRecovery} />
      )}
    </>
  );
}

function PerfLoadSection({ colors, loads }: { colors: typeof Colors.dark; loads: DailyLoad[] }) {
  const byDate = sumLoadsByDate(loads);
  const numDays = byDate.length;
  const barData = byDate.map((d) => ({ value: d.load, label: d.date.slice(8), frontColor: colors.accent }));
  const total = byDate.reduce((s, d) => s + d.load, 0);
  const avg = numDays > 0 ? Math.round(total / numDays) : 0;
  const barWidth = numDays <= 7 ? 28 : numDays <= 14 ? 18 : numDays <= 30 ? 10 : 6;
  const spacing = numDays <= 7 ? 12 : numDays <= 14 ? 8 : numDays <= 30 ? 4 : 2;

  return (
    <>
      <Card style={{ backgroundColor: colors.card }}>
        {barData.length > 0 ? (
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
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sem dados</Text>
        )}
      </Card>
      <View style={styles.perfCardsRow}>
        <Card style={[styles.perfMiniCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.perfMiniValue, { color: colors.accent }]}>{total}</Text>
          <Text style={[styles.perfMiniLabel, { color: colors.textSecondary }]}>Total (pts)</Text>
        </Card>
        <Card style={[styles.perfMiniCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.perfMiniValue, { color: colors.tint }]}>{avg}</Text>
          <Text style={[styles.perfMiniLabel, { color: colors.textSecondary }]}>Média/dia</Text>
        </Card>
      </View>
    </>
  );
}

function PerfRecoverySection({ colors, recovery }: { colors: typeof Colors.dark; recovery: DailyRecovery[] }) {
  const sorted = [...recovery].sort((a, b) => a.date.localeCompare(b.date));
  const dimensions: { key: keyof DailyRecovery; label: string; color: string }[] = [
    { key: 'sleep', label: 'Sono', color: '#3B82F6' },
    { key: 'soreness', label: 'Dor', color: '#E74C3C' },
    { key: 'fatigue', label: 'Fadiga', color: '#F5C542' },
    { key: 'mood', label: 'Humor', color: '#46C696' },
    { key: 'stress', label: 'Estresse', color: '#A855F7' },
  ];
  const lineData = sorted.map((r) => ({ value: r.total, label: r.date.slice(8) }));
  const avgTotal = sorted.length > 0
    ? Math.round((sorted.reduce((s, r) => s + r.total, 0) / sorted.length) * 10) / 10 : 0;
  const dimAvgs = dimensions.map((dim) => ({
    label: dim.label, color: dim.color,
    avg: sorted.length > 0
      ? Math.round((sorted.reduce((s, r) => s + (r[dim.key] as number), 0) / sorted.length) * 10) / 10 : 0,
  }));
  const today = sorted[sorted.length - 1];

  return (
    <>
      {today && (
        <Card style={{ backgroundColor: colors.card }}>
          <Text style={[styles.perfSectionLabel, { color: colors.text }]}>Hoje</Text>
          <View style={styles.perfTodayGrid}>
            {dimensions.map((dim) => (
              <View key={dim.key} style={styles.perfTodayItem}>
                <Text style={[styles.perfTodayValue, { color: dim.color }]}>{today[dim.key] as number}</Text>
                <Text style={[styles.perfTodayLabel, { color: colors.textSecondary }]}>{dim.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.perfTodayTotalRow}>
            <Text style={[styles.perfTodayTotalLabel, { color: colors.textSecondary }]}>Total:</Text>
            <Text style={[styles.perfTodayTotalValue, { color: colors.tint }]}>{today.total}/25</Text>
          </View>
        </Card>
      )}

      <Card style={{ backgroundColor: colors.card }}>
        <Text style={[styles.perfSectionLabel, { color: colors.text }]}>Evolução</Text>
        {lineData.length > 0 ? (
          <LineChart
            data={lineData}
            width={CHART_WIDTH}
            height={180}
            color={colors.accent}
            thickness={2}
            noOfSections={5}
            maxValue={25}
            stepValue={5}
            yAxisColor="transparent"
            xAxisColor={colors.border}
            yAxisTextStyle={{ color: colors.textSecondary, fontFamily: Fonts.bodyRegular, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontFamily: Fonts.bodyRegular, fontSize: 9 }}
            dataPointsColor={colors.accent}
            dataPointsRadius={3}
            isAnimated
            hideRules
            areaChart
            startFillColor={colors.accent + '33'}
            endFillColor={colors.accent + '05'}
          />
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sem dados</Text>
        )}
      </Card>

      <Card style={{ backgroundColor: colors.card }}>
        <Text style={[styles.perfSectionLabel, { color: colors.text }]}>Média por Dimensão</Text>
        {dimAvgs.map((dim) => (
          <View key={dim.label} style={styles.perfDimRow}>
            <View style={[styles.perfDimDot, { backgroundColor: dim.color }]} />
            <Text style={[styles.perfDimLabel, { color: colors.text }]}>{dim.label}</Text>
            <View style={styles.perfDimBarBg}>
              <View style={[styles.perfDimBarFill, { width: `${(dim.avg / 5) * 100}%`, backgroundColor: dim.color }]} />
            </View>
            <Text style={[styles.perfDimValue, { color: colors.textSecondary }]}>{dim.avg}/5</Text>
          </View>
        ))}
      </Card>

      <Card style={[styles.perfMiniCard, { backgroundColor: colors.card, alignSelf: 'flex-start' }]}>
        <Text style={[styles.perfMiniValue, { color: colors.tint }]}>{avgTotal}/25</Text>
        <Text style={[styles.perfMiniLabel, { color: colors.textSecondary }]}>Média do período</Text>
      </Card>
    </>
  );
}

/* ── My Responses (Athlete only) ── */
const MY_ATHLETE_ID = '1'; // Mock: logged-in athlete

function MyResponsesSection({ colors }: { colors: typeof Colors.dark }) {
  const allDates = getUniqueDates(MOCK_DAILY_RECOVERY.filter((r) => r.athleteId === MY_ATHLETE_ID));
  const [selectedDate, setSelectedDate] = useState(allDates[allDates.length - 1] || '');

  const dateIdx = allDates.indexOf(selectedDate);
  const canPrev = dateIdx > 0;
  const canNext = dateIdx < allDates.length - 1;

  const dayRecovery = MOCK_DAILY_RECOVERY.find(
    (r) => r.athleteId === MY_ATHLETE_ID && r.date === selectedDate
  );
  const dayLoad = MOCK_DAILY_LOADS.find(
    (l) => l.athleteId === MY_ATHLETE_ID && l.date === selectedDate
  );

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

      {/* Pre-training response */}
      <Text style={[styles.historySectionTitle, { color: colors.text }]}>Pré-Treino</Text>
      {dayRecovery ? (
        <Card style={{ backgroundColor: colors.card }}>
          <View style={styles.historyBadgeRow}>
            <Badge label={`${dayRecovery.total}/25 - ${getRecoveryLabel(dayRecovery.total)}`} color={getRecoveryColor(dayRecovery.total)} />
          </View>
          <View style={styles.historyGrid}>
            {([
              { label: 'Sono', value: dayRecovery.sleep, color: '#3B82F6' },
              { label: 'Dor', value: dayRecovery.soreness, color: '#E74C3C' },
              { label: 'Fadiga', value: dayRecovery.fatigue, color: '#F5C542' },
              { label: 'Humor', value: dayRecovery.mood, color: '#46C696' },
              { label: 'Estresse', value: dayRecovery.stress, color: '#A855F7' },
            ]).map((item) => (
              <View key={item.label} style={styles.historyItem}>
                <Text style={[styles.historyValue, { color: item.color }]}>{item.value}</Text>
                <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : (
        <Card style={{ backgroundColor: colors.card }}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sem resposta neste dia</Text>
        </Card>
      )}

      {/* Post-training response */}
      <Text style={[styles.historySectionTitle, { color: colors.text }]}>Pós-Treino</Text>
      {dayLoad ? (
        <Card style={{ backgroundColor: colors.card }}>
          <View style={styles.historyLoadRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.historyLoadLabel, { color: colors.textSecondary }]}>
                Esforço {dayLoad.rpe} x {dayLoad.duration} min
              </Text>
            </View>
            <Text style={[styles.historyLoadValue, { color: colors.accent }]}>{dayLoad.load} pts</Text>
          </View>
        </Card>
      ) : (
        <Card style={{ backgroundColor: colors.card }}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sem resposta neste dia</Text>
        </Card>
      )}
    </>
  );
}

/* ── Add Question Form ── */
function AddQuestionForm({
  colors,
  newLabel, setNewLabel,
  newLow, setNewLow,
  newHigh, setNewHigh,
  onSave, onCancel,
}: {
  colors: typeof Colors.dark;
  newLabel: string; setNewLabel: (s: string) => void;
  newLow: string; setNewLow: (s: string) => void;
  newHigh: string; setNewHigh: (s: string) => void;
  onSave: () => void; onCancel: () => void;
}) {
  return (
    <Card style={{ backgroundColor: colors.card }}>
      <Text style={[styles.formTitle, { color: colors.text }]}>
        Nova pergunta
      </Text>
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
        <TouchableOpacity style={[styles.formCancel, { borderColor: colors.border }]} onPress={onCancel}>
          <Text style={[styles.formCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.formSave, { backgroundColor: colors.tint }]} onPress={onSave}>
          <Text style={styles.formSaveText}>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 20,
  },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 14,
  },
  tabIconBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    gap: 2,
  },
  tabIconText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
  },
  subtitle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionLabel: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 15,
    marginBottom: 12,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleNumber: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 18,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  scaleLabelText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11,
  },
  rpeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  rpeButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rpeNumber: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 18,
  },
  rpeLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  durationBtn: {
    width: 48,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
  },
  durationDisplay: {
    alignItems: 'center',
    minWidth: 70,
  },
  durationValue: {
    fontFamily: Fonts.titleBold,
    fontSize: 32,
  },
  durationUnit: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
  },
  resultTitle: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 14,
    textAlign: 'center',
  },
  resultScore: {
    fontFamily: Fonts.titleBold,
    fontSize: 36,
    textAlign: 'center',
  },
  resultDetail: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  /* Date selector */
  dateSelectorRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 4, marginBottom: 12 },
  dateArrow: { padding: 8 },
  dateCenter: { flex: 1, alignItems: 'center' },
  dateText: { fontFamily: Fonts.titleSemiBold, fontSize: 15 },
  dateSubtext: { fontFamily: Fonts.bodyRegular, fontSize: 11, marginTop: 2 },
  /* History */
  historySectionTitle: { fontFamily: Fonts.titleSemiBold, fontSize: 16, marginTop: 12, marginBottom: 8 },
  historyBadgeRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  historyGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  historyItem: { alignItems: 'center' },
  historyValue: { fontFamily: Fonts.titleBold, fontSize: 24 },
  historyLabel: { fontFamily: Fonts.bodyRegular, fontSize: 11, marginTop: 2 },
  historyLoadRow: { flexDirection: 'row', alignItems: 'center' },
  historyLoadLabel: { fontFamily: Fonts.bodyRegular, fontSize: 14 },
  historyLoadValue: { fontFamily: Fonts.titleBold, fontSize: 20 },
  emptyText: { fontFamily: Fonts.bodyRegular, fontSize: 14, textAlign: 'center', paddingVertical: 8 },
  /* Add question */
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addQuestionText: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 14,
  },
  /* Form */
  formTitle: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 15,
    marginBottom: 12,
  },
  formInput: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  formRow: {
    flexDirection: 'row',
  },
  formHint: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11,
    marginBottom: 4,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  formCancelText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
  },
  formSave: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  formSaveText: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  /* Performance section */
  perfPeriodDropdown: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, marginBottom: 12, alignSelf: 'flex-start' },
  perfPeriodText: { fontFamily: Fonts.bodySemiBold, fontSize: 13 },
  perfCustomLabel: { fontFamily: Fonts.bodyRegular, fontSize: 12, textAlign: 'center', marginBottom: 8 },
  perfModalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', paddingHorizontal: 32 },
  perfModalContent: { borderRadius: 16, maxHeight: 400, paddingVertical: 8 },
  perfModalTitle: { fontFamily: Fonts.titleSemiBold, fontSize: 16, paddingHorizontal: 16, paddingVertical: 12 },
  perfModalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  perfModalOptionText: { fontFamily: Fonts.bodyRegular, fontSize: 15 },
  perfFormTitle: { fontFamily: Fonts.titleSemiBold, fontSize: 15, marginBottom: 12 },
  perfDateRangeRow: { flexDirection: 'row' },
  perfDateRangeLabel: { fontFamily: Fonts.bodyRegular, fontSize: 11, marginBottom: 4 },
  perfDateRangeInput: { fontFamily: Fonts.bodyRegular, fontSize: 14, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  perfDateRangeButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
  perfDateRangeCancel: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  perfDateRangeCancelText: { fontFamily: Fonts.bodySemiBold, fontSize: 14 },
  perfDateRangeApply: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  perfDateRangeApplyText: { fontFamily: Fonts.titleSemiBold, fontSize: 14, color: '#FFFFFF' },
  perfSubTabRow: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 16 },
  perfSubTab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  perfSubTabText: { fontFamily: Fonts.titleSemiBold, fontSize: 13 },
  perfCardsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  perfMiniCard: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  perfMiniValue: { fontFamily: Fonts.titleBold, fontSize: 20 },
  perfMiniLabel: { fontFamily: Fonts.bodyRegular, fontSize: 11, marginTop: 2 },
  perfSectionLabel: { fontFamily: Fonts.titleSemiBold, fontSize: 15, marginBottom: 12 },
  perfTodayGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  perfTodayItem: { alignItems: 'center' },
  perfTodayValue: { fontFamily: Fonts.titleBold, fontSize: 24 },
  perfTodayLabel: { fontFamily: Fonts.bodyRegular, fontSize: 11, marginTop: 2 },
  perfTodayTotalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 6 },
  perfTodayTotalLabel: { fontFamily: Fonts.bodyRegular, fontSize: 14 },
  perfTodayTotalValue: { fontFamily: Fonts.titleBold, fontSize: 18 },
  perfDimRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  perfDimDot: { width: 10, height: 10, borderRadius: 5 },
  perfDimLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 13, width: 60 },
  perfDimBarBg: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB22' },
  perfDimBarFill: { height: 8, borderRadius: 4 },
  perfDimValue: { fontFamily: Fonts.bodyRegular, fontSize: 12, width: 32, textAlign: 'right' },
});
