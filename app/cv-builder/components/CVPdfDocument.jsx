import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111111',
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contactItem: {
    fontSize: 9,
    marginRight: 12,
    color: '#333333',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 3,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  experienceBlock: {
    marginBottom: 10,
  },
  experienceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleCompany: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  dates: {
    fontSize: 9,
    color: '#555555',
  },
  bulletText: {
    fontSize: 10,
    lineHeight: 1.4,
    marginTop: 2,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    fontSize: 9,
    marginRight: 8,
    marginBottom: 4,
  },
});

export default function CVPdfDocument(props) {
  const fullName = props.fullName || 'Your Name';
  const email = props.email || '';
  const phone = props.phone || '';
  const website = props.website || '';
  const summary = props.summary || '';
  const skills = props.skills || '';
  const experience = props.experience || [];

  const skillsList = skills
    .split(',')
    .map(function (item) { return item.trim(); })
    .filter(function (item) { return item.length > 0; });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.contactRow}>
            {email ? <Text style={styles.contactItem}>{email}</Text> : null}
            {phone ? <Text style={styles.contactItem}>{phone}</Text> : null}
            {website ? <Text style={styles.contactItem}>{website}</Text> : null}
          </View>
        </View>

        {summary ? (
          <View>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.paragraph}>{summary}</Text>
          </View>
        ) : null}

        {experience.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {experience.map(function (exp, index) {
              if (!exp.company && !exp.role) return null;
              return (
                <View key={index} style={styles.experienceBlock} wrap={false}>
                  <View style={styles.experienceHeaderRow}>
                    <Text style={styles.roleCompany}>
                      {exp.role}{exp.company ? ' - ' + exp.company : ''}
                    </Text>
                    <Text style={styles.dates}>{exp.dates}</Text>
                  </View>
                  {exp.bullets ? <Text style={styles.bulletText}>{exp.bullets}</Text> : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {skillsList.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsRow}>
              {skillsList.map(function (skill, index) {
                return (
                  <Text key={index} style={styles.skillTag}>
                    {skill}{index < skillsList.length - 1 ? '  •' : ''}
                  </Text>
                );
              })}
            </View>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}