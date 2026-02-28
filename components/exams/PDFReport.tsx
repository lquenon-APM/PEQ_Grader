"use client";

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { type Exam, type Student, type Grade } from "@/lib/db";

// Register custom font for professional look (Optional - standard fonts used for now)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
    fontSize: 10,
    color: "#333333",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
  },
  schoolName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  examTitle: {
    fontSize: 12,
    color: "#666666",
  },
  studentSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  competencyBox: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 10,
  },
  competencyTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 4,
  },
  verdictLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: "bold",
    fontSize: 9,
    textTransform: "uppercase",
  },
  indicator: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 10,
  },
  indicatorBullet: {
    width: 10,
    fontSize: 10,
  },
  indicatorText: {
    flex: 1,
  },
  observations: {
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: "#F3F4F6",
    fontStyle: "italic",
    color: "#6B7280",
  },
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: 150,
    height: 60,
    borderWidth: 0.5,
    borderColor: "#D1D5DB",
    marginTop: 10,
  },
});

interface PDFReportProps {
  exam: Exam;
  student: Student;
  grades: Grade[];
}

export default function PDFReport({ exam, student, grades }: PDFReportProps) {
  return (
    <Document title={`Rapport_${student.lastName}_${exam.label}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.schoolName}>Institution d&apos;Enseignement Technique</Text>
          <Text style={styles.examTitle}>Session d&apos;évaluation : {exam.label} - {new Date(exam.date).toLocaleDateString()}</Text>
        </View>

        {/* Student Info */}
        <View style={styles.studentSection}>
          <Text style={styles.studentName}>{student.lastName} {student.firstName}</Text>
          <Text>Classe : {student.group}</Text>
          <Text>Grille de référence : {exam.gridName}</Text>
        </View>

        {/* Competencies */}
        {exam.frozenGridStructure.competencies.map((comp) => {
          const pk = `${exam.id}+${student.id}+${comp.id}`;
          const grade = grades.find(g => g.pk === pk);
          const gradeData = grade ? JSON.parse(grade.data) : { checkedIndicatorIds: [], observations: {} };

          return (
            <View key={comp.id} style={styles.competencyBox} wrap={false}>
              <View style={styles.verdictLine}>
                <Text style={styles.competencyTitle}>{comp.label}</Text>
                {grade && (
                  <Text style={[styles.statusBadge, {
                    backgroundColor: grade.status === "ACQUIS" ? "#D1FAE5" : grade.status === "NON_ACQUIS" ? "#FEE2E2" : "#FEF3C7",
                    color: grade.status === "ACQUIS" ? "#065F46" : grade.status === "NON_ACQUIS" ? "#991B1B" : "#92400E",
                  }]}>
                    {grade.status}
                  </Text>
                )}
              </View>

              {/* Indicators */}
              {comp.indicators.map((ind) => (
                <View key={ind.id} style={styles.indicator}>
                  <Text style={styles.indicatorBullet}>
                    {gradeData.checkedIndicatorIds.includes(ind.id) ? "☑" : "☐"}
                  </Text>
                  <Text style={styles.indicatorText}>
                    {ind.text} {ind.critical ? " (Critique)" : ""}
                  </Text>
                </View>
              ))}

              {/* Specific Observations */}
              {Object.keys(gradeData.observations || {}).length > 0 && (
                <View style={styles.observations}>
                  {Object.entries(gradeData.observations).map(([indId, obs]: any) => (
                    <Text key={indId}>• {obs}</Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Footer & Signature */}
        <View style={styles.footer}>
          <View>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Décision Finale :</Text>
            <Text>................................................................</Text>
          </View>
          <View>
            <Text style={{ textAlign: "center" }}>Signature de l&apos;examinateur</Text>
            <View style={styles.signatureBox} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
