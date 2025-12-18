import React from 'react';
import { Section, SubSection, FormField, FormValues, FormErrors } from '../types/form.types';
import FormFieldRenderer from './FormFieldRenderer';
import './FormSection.css';

interface FormSectionProps {
  section: Section;
  formValues: FormValues;
  errors: FormErrors;
  expandedSections: Set<string>;
  onFieldChange: (fieldKey: string, value: any) => void;
  onToggleSection: (sectionName: string) => void;
  getFieldKey: (sectionName: string, subSectionName: string, field: FormField) => string;
}

const FormSection: React.FC<FormSectionProps> = ({
  section,
  formValues,
  errors,
  expandedSections,
  onFieldChange,
  onToggleSection,
  getFieldKey,
}) => {
  const isExpanded = expandedSections.has(section.name);

  const handleToggle = () => {
    onToggleSection(section.name);
  };

  return (
    <div className="form-section">
      <div className="section-header" onClick={handleToggle}>
        <h2 className="section-title">{section.name}</h2>
        <span className="section-toggle">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="section-content">
          {section.subSections.map((subSection, subIndex) => (
            <SubSectionComponent
              key={`${section.name}-${subSection.name}-${subIndex}`}
              sectionName={section.name}
              subSection={subSection}
              formValues={formValues}
              errors={errors}
              expandedSections={expandedSections}
              onFieldChange={onFieldChange}
              onToggleSection={onToggleSection}
              getFieldKey={getFieldKey}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SubSectionComponentProps {
  sectionName: string;
  subSection: SubSection;
  formValues: FormValues;
  errors: FormErrors;
  expandedSections: Set<string>;
  onFieldChange: (fieldKey: string, value: any) => void;
  onToggleSection: (sectionName: string) => void;
  getFieldKey: (sectionName: string, subSectionName: string, field: FormField) => string;
}

const SubSectionComponent: React.FC<SubSectionComponentProps> = ({
  sectionName,
  subSection,
  formValues,
  errors,
  expandedSections,
  onFieldChange,
  onToggleSection,
  getFieldKey,
}) => {
  const subSectionKey = `${sectionName}-${subSection.name}`;
  const isExpanded = expandedSections.has(subSectionKey);

  const handleToggle = () => {
    onToggleSection(subSectionKey);
  };

  // Filter out hidden fields
  const visibleFields = subSection.fields.filter((field) => !field.isHidden);

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <div className="subsection">
      {subSection.name && (
        <div className="subsection-header" onClick={handleToggle}>
          <h3 className="subsection-title">{subSection.name}</h3>
          <span className="subsection-toggle">{isExpanded ? '▼' : '▶'}</span>
        </div>
      )}

      {isExpanded && (
        <div className="subsection-content">
          <div className="fields-grid">
            {visibleFields
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((field, fieldIndex) => {
                const fieldKey = getFieldKey(sectionName, subSection.name, field);
                return (
                  <FormFieldRenderer
                    key={`${fieldKey}-${fieldIndex}`}
                    field={field}
                    fieldKey={fieldKey}
                    value={formValues[fieldKey] || ''}
                    error={errors[fieldKey]}
                    onChange={(value) => onFieldChange(fieldKey, value)}
                  />
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormSection;

