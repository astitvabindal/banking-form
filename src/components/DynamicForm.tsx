import React, { useState, useEffect } from 'react';
import { FormData, FormValues, FormErrors, Section, SubSection, FormField } from '../types/form.types';
import FormSection from './FormSection';
import './DynamicForm.css';

interface DynamicFormProps {
  formData: FormData | null;
  onSubmit: (values: FormValues) => void;
  isSubmitting?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formData, onSubmit, isSubmitting = false }) => {
  const [formValues, setFormValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Helper function to generate unique field keys
  const getFieldKey = (sectionName: string, subSectionName: string, field: FormField): string => {
    return `${sectionName}__${subSectionName}__${field.name}__${field.sfField || field.order}`;
  };

  // Initialize form values and visible sections
  useEffect(() => {
    if (!formData) return;

    const initialValues: FormValues = {};
    const initialVisible = new Set<string>();
    const initialExpanded = new Set<string>();

    formData.data.templateWrap.sections.forEach((section) => {
      initialVisible.add(section.name);
      if (section.isPrePopulateData) {
        initialExpanded.add(section.name);
      }

      section.subSections.forEach((subSection) => {
        if (subSection.isPrePopulateData) {
          initialExpanded.add(`${section.name}-${subSection.name}`);
        }

        subSection.fields.forEach((field) => {
          const fieldKey = getFieldKey(section.name, subSection.name, field);
          initialValues[fieldKey] = field.value || '';
        });
      });
    });

    setFormValues(initialValues);
    setVisibleSections(initialVisible);
    setExpandedSections(initialExpanded);
  }, [formData]);

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));

    // Clear error when user starts typing
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }

    // Handle dependent sections
    if (formData) {
      checkDependentSections(fieldKey, value);
    }
  };

  const checkDependentSections = (fieldKey: string, value: any) => {
    if (!formData) return;

    const dependentRules = formData.data.templateWrap.dependentSectionsDetails;
    const fieldParts = fieldKey.split('__');
    const sectionName = fieldParts[0];
    const fieldName = fieldParts[3]; // sfField

    dependentRules.forEach((rule) => {
      if (rule.sectionName === sectionName && rule.fieldName === fieldName) {
        if (value === rule.value) {
          // Show dependent section
          setVisibleSections((prev) => {
            const newSet = new Set(prev);
            newSet.add(rule.dependentSectionValue);
            return newSet;
          });
        } else {
          // Hide dependent section and clear its values
          setVisibleSections((prev) => {
            const newSet = new Set(prev);
            newSet.delete(rule.dependentSectionValue);
            return newSet;
          });

          // Clear values of hidden section
          formData.data.templateWrap.sections.forEach((section) => {
            if (section.name === rule.dependentSectionValue) {
              section.subSections.forEach((subSection) => {
                subSection.fields.forEach((field) => {
                  const key = getFieldKey(section.name, subSection.name, field);
                  setFormValues((prev) => ({
                    ...prev,
                    [key]: '',
                  }));
                });
              });
            }
          });
        }
      }
    });
  };

  const validateForm = (): { isValid: boolean; errors: FormErrors } => {
    if (!formData) return { isValid: false, errors: {} };

    const newErrors: FormErrors = {};

    formData.data.templateWrap.sections.forEach((section) => {
      if (!visibleSections.has(section.name)) return;

      section.subSections.forEach((subSection) => {
        subSection.fields.forEach((field) => {
          if (field.isHidden) return;

          const fieldKey = getFieldKey(section.name, subSection.name, field);
          const value = formValues[fieldKey] || '';

          // Mandatory validation
          if (field.mandatory && !value.trim()) {
            newErrors[fieldKey] = `${field.name} is required`;
          }

          // Length validation
          if (value && field.valueLength) {
            const maxLength = parseInt(field.valueLength);
            if (value.length > maxLength) {
              newErrors[fieldKey] = `${field.name} must be at most ${maxLength} characters`;
            }
          }

          if (value && field.valueMinLength) {
            const minLength = parseInt(field.valueMinLength);
            if (value.length < minLength) {
              newErrors[fieldKey] = `${field.name} must be at least ${minLength} characters`;
            }
          }

          // Number validation
          if (field.inputType === 'NUMBER' && value) {
            if (isNaN(Number(value))) {
              newErrors[fieldKey] = `${field.name} must be a valid number`;
            }
          }

          // Date validation
          if (field.inputType === 'DATE' && value) {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              newErrors[fieldKey] = `${field.name} must be a valid date`;
            }
            if (field.isFutureDate === false && date > new Date()) {
              newErrors[fieldKey] = `${field.name} cannot be a future date`;
            }
          }

          // Image validation
          if (field.fieldType === 'IMAGE' && field.mandatory) {
            const imageValue = Array.isArray(value) ? value : (value ? [value] : []);
            if (imageValue.length === 0) {
              newErrors[fieldKey] = `${field.name} is required. Please upload at least one image.`;
            }
            // Check min/max image count if specified in section
            const minImages = subSection.minImageCapture || 0;
            if (minImages > 0 && imageValue.length < minImages) {
              newErrors[fieldKey] = `${field.name} requires at least ${minImages} image(s).`;
            }
            const maxImages = subSection.maxImageCapture || 0;
            if (maxImages > 0 && imageValue.length > maxImages) {
              newErrors[fieldKey] = `${field.name} allows maximum ${maxImages} image(s).`;
            }
          }

          // Video validation
          if (field.fieldType === 'VIDEO' && field.mandatory) {
            const videoValue = Array.isArray(value) ? value : (value ? [value] : []);
            if (videoValue.length === 0) {
              newErrors[fieldKey] = `${field.name} is required. Please upload at least one video.`;
            }
          }

          // Email validation (if input type suggests email)
          if (field.inputType === 'TEXT' && value && value.includes('@')) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              newErrors[fieldKey] = `${field.name} must be a valid email address`;
            }
          }

          // Phone number validation (if field name suggests phone)
          if (field.inputType === 'NUMBER' && value && (field.name.toLowerCase().includes('phone') || field.name.toLowerCase().includes('mobile'))) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(value.replace(/\D/g, ''))) {
              newErrors[fieldKey] = `${field.name} must be a valid 10-digit phone number`;
            }
          }
        });
      });
    });

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();
    if (validation.isValid) {
      onSubmit(formValues);
    } else {
      // Scroll to first error after state update
      setTimeout(() => {
        const firstErrorKey = Object.keys(validation.errors)[0];
        if (firstErrorKey) {
          const element = document.querySelector(`[data-field-key="${firstErrorKey}"]`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  };

  if (!formData) {
    return (
      <div className="form-container">
        <div className="loading-state">Loading form data...</div>
      </div>
    );
  }

  const visibleSectionsList = formData.data.templateWrap.sections.filter((section) =>
    visibleSections.has(section.name)
  );

  return (
    <div className="dynamic-form-container">
      <div className="form-header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo-placeholder">
              <img 
                src="/logo.png" 
                alt="Company Logo" 
                className="company-logo"
                onError={(e) => {
                  // Hide image if logo doesn't exist, show placeholder
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="logo-placeholder-text">
                <span className="logo-icon">🏢</span>
                <span>Your Logo</span>
              </div>
            </div>
          </div>
          <div className="header-text">
            <div className="form-type-badge">{formData.data.templateWrap.formType || 'Dynamic Form'}</div>
            <h1>{formData.data.templateWrap.formType || 'Dynamic Form'}</h1>
            <p className="form-subtitle">{formData.statusMessage}</p>
          </div>
        </div>
        <div className="header-decoration"></div>
      </div>

      <form onSubmit={handleSubmit} className="dynamic-form">
        {visibleSectionsList.map((section, sectionIndex) => (
          <FormSection
            key={`${section.name}-${sectionIndex}`}
            section={section}
            formValues={formValues}
            errors={errors}
            expandedSections={expandedSections}
            onFieldChange={handleFieldChange}
            onToggleSection={toggleSection}
            getFieldKey={getFieldKey}
          />
        ))}

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="submit-spinner"></span>
                Submitting...
              </>
            ) : (
              'Submit Form'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DynamicForm;

