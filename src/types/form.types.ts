// Type definitions for the dynamic form JSON structure

export interface FormField {
  value: string;
  valueMinLength?: string;
  valueLength?: string;
  speechToText: boolean;
  sfRecordId: string;
  sfObject: string;
  sfField: string;
  questionProfile: string;
  placeholder: string;
  order: number | null;
  name: string;
  mandatory: boolean;
  isSingleValueSelection: boolean;
  isReadOnly: boolean;
  isHidden: boolean;
  isGroup: boolean;
  isFutureDate: boolean;
  inputType: string;
  images: any[];
  formula: string;
  fieldType: string;
  dropDownValues: string;
  dependentFieldDetails: any;
}

export interface SubSection {
  type: string;
  placeholder: string | null;
  order: number;
  name: string;
  minImageCapture: number;
  maxImageCapture: number;
  isPrePopulateData: boolean;
  isExpanded: boolean;
  fields: FormField[];
  duplicationButtonTitle?: string;
  duplicationAllowed?: boolean;
  duplicateSubSection?: boolean;
}

export interface Section {
  type: string;
  subSections: SubSection[];
  placeholder: string | null;
  order: number;
  name: string;
  minImageCapture: number;
  maxLengthInSec?: number;
  maxImageCapture: number;
  isPrePopulateData: boolean;
  isMultipleSection: boolean;
  duplicationButtonTitle: string | null;
  duplicationAllowed: boolean;
}

export interface DependentSectionDetail {
  value: string;
  sectionName: string;
  fieldName: string;
  dependentSectionValue: string;
}

export interface TemplateWrap {
  sections: Section[];
  formType: string;
  dependentSectionsDetails: DependentSectionDetail[];
}

export interface FormData {
  statusMessage: string;
  statusCode: string;
  status: string;
  data: {
    templateWrap: TemplateWrap;
    fieldExecutive: any;
    cases: any;
  };
}

export interface FormValues {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

