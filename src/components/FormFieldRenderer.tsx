import React from 'react';
import { FormField } from '../types/form.types';
import './FormFieldRenderer.css';

interface FormFieldRendererProps {
  field: FormField;
  fieldKey: string;
  value: any;
  error?: string;
  onChange: (value: any) => void;
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  field,
  fieldKey,
  value,
  error,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const renderField = () => {
    switch (field.fieldType) {
      case 'INPUT':
        return renderInput();
      case 'DROPDOWN':
        return renderDropdown();
      case 'MULTILINE_INPUT':
        return renderTextarea();
      case 'DATE_PICKER':
        return renderDatePicker();
      case 'YEAR_PICKER':
        return renderYearPicker();
      case 'CHECKBOX':
        return renderCheckbox();
      case 'RADIO':
        return renderRadio();
      case 'MULTIPLE_TEXTVALUE':
        return renderMultipleTextValue();
      case 'IMAGE':
        return renderImageUpload();
      case 'VIDEO':
        return renderVideoUpload();
      default:
        return renderInput();
    }
  };

  const renderInput = () => {
    const inputType = field.inputType === 'NUMBER' ? 'number' : 
                     field.inputType === 'DATE' ? 'date' : 
                     'text';
    
    return (
      <input
        type={inputType}
        id={fieldKey}
        value={value}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={field.isReadOnly}
        required={field.mandatory}
        minLength={field.valueMinLength ? parseInt(field.valueMinLength) : undefined}
        maxLength={field.valueLength ? parseInt(field.valueLength) : undefined}
        className={`form-input ${error ? 'error' : ''}`}
        data-field-key={fieldKey}
      />
    );
  };

  const renderTextarea = () => {
    return (
      <textarea
        id={fieldKey}
        value={value}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={field.isReadOnly}
        required={field.mandatory}
        minLength={field.valueMinLength ? parseInt(field.valueMinLength) : undefined}
        maxLength={field.valueLength ? parseInt(field.valueLength) : undefined}
        rows={4}
        className={`form-textarea ${error ? 'error' : ''}`}
        data-field-key={fieldKey}
      />
    );
  };

  const renderDropdown = () => {
    const options = field.dropDownValues
      ? field.dropDownValues.split(',').map((opt) => opt.trim()).filter(Boolean)
      : [];

    return (
      <select
        id={fieldKey}
        value={value}
        onChange={handleChange}
        disabled={field.isReadOnly}
        required={field.mandatory}
        className={`form-select ${error ? 'error' : ''}`}
        data-field-key={fieldKey}
      >
        <option value="">Select {field.name}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  };

  const renderDatePicker = () => {
    return (
      <input
        type="date"
        id={fieldKey}
        value={value}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={field.isReadOnly}
        required={field.mandatory}
        max={field.isFutureDate === false ? new Date().toISOString().split('T')[0] : undefined}
        className={`form-input ${error ? 'error' : ''}`}
        data-field-key={fieldKey}
      />
    );
  };

  const renderYearPicker = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    return (
      <select
        id={fieldKey}
        value={value}
        onChange={handleChange}
        disabled={field.isReadOnly}
        required={field.mandatory}
        className={`form-select ${error ? 'error' : ''}`}
        data-field-key={fieldKey}
      >
        <option value="">Select Year</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    );
  };

  const renderCheckbox = () => {
    return (
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          id={fieldKey}
          checked={value === 'true' || value === true}
          onChange={(e) => onChange(e.target.checked)}
          disabled={field.isReadOnly}
          required={field.mandatory}
          className={`form-checkbox ${error ? 'error' : ''}`}
          data-field-key={fieldKey}
        />
        <label htmlFor={fieldKey} className="checkbox-label">
          {field.placeholder || field.name}
        </label>
      </div>
    );
  };

  const renderRadio = () => {
    const options = field.dropDownValues
      ? field.dropDownValues.split(',').map((opt) => opt.trim()).filter(Boolean)
      : [];

    return (
      <div className="radio-group">
        {options.map((option, index) => (
          <div key={index} className="radio-option">
            <input
              type="radio"
              id={`${fieldKey}-${index}`}
              name={fieldKey}
              value={option}
              checked={value === option}
              onChange={handleChange}
              disabled={field.isReadOnly}
              required={field.mandatory}
              className={`form-radio ${error ? 'error' : ''}`}
              data-field-key={fieldKey}
            />
            <label htmlFor={`${fieldKey}-${index}`} className="radio-label">
              {option}
            </label>
          </div>
        ))}
      </div>
    );
  };

  const renderMultipleTextValue = () => {
    // For multiple text values, we'll render as a comma-separated input
    return (
      <input
        type="text"
        id={fieldKey}
        value={value}
        onChange={handleChange}
        placeholder={field.placeholder || 'Enter values separated by commas'}
        disabled={field.isReadOnly}
        required={field.mandatory}
        className={`form-input ${error ? 'error' : ''}`}
        data-field-key={fieldKey}
      />
    );
  };

  const renderImageUpload = () => {
    const fileList = Array.isArray(value) ? value : (value ? [value] : []);
    const maxFiles = field.valueLength ? parseInt(field.valueLength) : 10;
    const maxSizeMB = 5; // 5MB default
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach((file) => {
        // Validate file type
        if (!acceptedTypes.includes(file.type)) {
          errors.push(`${file.name}: Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.`);
          return;
        }

        // Validate file size (5MB default)
        if (file.size > maxSizeMB * 1024 * 1024) {
          errors.push(`${file.name}: File size exceeds ${maxSizeMB}MB limit.`);
          return;
        }

        validFiles.push(file);
      });

      // Check max files limit
      const totalFiles = fileList.length + validFiles.length;
      if (totalFiles > maxFiles) {
        errors.push(`Maximum ${maxFiles} file(s) allowed.`);
      }

      if (errors.length > 0) {
        // Show errors (you can enhance this with a toast notification)
        alert(errors.join('\n'));
      }

      // Convert files to base64 or File objects
      const newFiles = [...fileList, ...validFiles];
      onChange(newFiles.length === 1 ? newFiles[0] : newFiles);
    };

    const removeFile = (index: number) => {
      const newFiles = Array.isArray(value) ? [...value] : [value];
      newFiles.splice(index, 1);
      onChange(newFiles.length === 0 ? '' : (newFiles.length === 1 ? newFiles[0] : newFiles));
    };

    const getFilePreview = (file: File | string, index: number) => {
      if (typeof file === 'string') {
        // If it's a URL string
        return (
          <div key={index} className="image-preview-item">
            <img src={file} alt={`Preview ${index + 1}`} className="preview-image" />
            <button
              type="button"
              onClick={() => removeFile(index)}
              className="remove-image-btn"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        );
      }

      // If it's a File object
      const objectUrl = URL.createObjectURL(file);
      return (
        <div key={index} className="image-preview-item">
          <img src={objectUrl} alt={`Preview ${index + 1}`} className="preview-image" />
          <button
            type="button"
            onClick={() => {
              removeFile(index);
              URL.revokeObjectURL(objectUrl);
            }}
            className="remove-image-btn"
            aria-label="Remove image"
          >
            ×
          </button>
          <div className="file-info">{file.name}</div>
        </div>
      );
    };

    return (
      <div className="file-upload-container">
        <div className="file-upload-wrapper">
          <input
            type="file"
            id={fieldKey}
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            multiple={maxFiles > 1}
            onChange={handleFileChange}
            disabled={field.isReadOnly}
            className={`file-input ${error ? 'error' : ''}`}
            data-field-key={fieldKey}
            aria-label={field.name}
          />
          <label htmlFor={fieldKey} className="file-upload-label">
            <span className="upload-icon">📷</span>
            <span className="upload-text">
              {field.placeholder || `Click to upload image${maxFiles > 1 ? 's' : ''}`}
            </span>
            <span className="upload-hint">
              {maxFiles > 1 ? `(Max ${maxFiles} files, ${maxSizeMB}MB each)` : `(Max ${maxSizeMB}MB)`}
            </span>
          </label>
        </div>
        {fileList.length > 0 && (
          <div className="file-preview-grid">
            {fileList.map((file, index) => getFilePreview(file, index))}
          </div>
        )}
      </div>
    );
  };

  const renderVideoUpload = () => {
    const fileList = Array.isArray(value) ? value : (value ? [value] : []);
    const maxFiles = field.valueLength ? parseInt(field.valueLength) : 5;
    const maxSizeMB = 50; // 50MB default for videos
    const acceptedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach((file) => {
        // Validate file type
        if (!acceptedTypes.includes(file.type)) {
          errors.push(`${file.name}: Invalid file type. Only videos (MP4, WebM, OGG, MOV) are allowed.`);
          return;
        }

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          errors.push(`${file.name}: File size exceeds ${maxSizeMB}MB limit.`);
          return;
        }

        validFiles.push(file);
      });

      // Check max files limit
      const totalFiles = fileList.length + validFiles.length;
      if (totalFiles > maxFiles) {
        errors.push(`Maximum ${maxFiles} file(s) allowed.`);
      }

      if (errors.length > 0) {
        alert(errors.join('\n'));
      }

      const newFiles = [...fileList, ...validFiles];
      onChange(newFiles.length === 1 ? newFiles[0] : newFiles);
    };

    const removeFile = (index: number) => {
      const newFiles = Array.isArray(value) ? [...value] : [value];
      newFiles.splice(index, 1);
      onChange(newFiles.length === 0 ? '' : (newFiles.length === 1 ? newFiles[0] : newFiles));
    };

    const getFilePreview = (file: File | string, index: number) => {
      if (typeof file === 'string') {
        return (
          <div key={index} className="video-preview-item">
            <video src={file} controls className="preview-video" />
            <button
              type="button"
              onClick={() => removeFile(index)}
              className="remove-video-btn"
              aria-label="Remove video"
            >
              ×
            </button>
          </div>
        );
      }

      const objectUrl = URL.createObjectURL(file);
      return (
        <div key={index} className="video-preview-item">
          <video src={objectUrl} controls className="preview-video" />
          <button
            type="button"
            onClick={() => {
              removeFile(index);
              URL.revokeObjectURL(objectUrl);
            }}
            className="remove-video-btn"
            aria-label="Remove video"
          >
            ×
          </button>
          <div className="file-info">{file.name}</div>
        </div>
      );
    };

    return (
      <div className="file-upload-container">
        <div className="file-upload-wrapper">
          <input
            type="file"
            id={fieldKey}
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            multiple={maxFiles > 1}
            onChange={handleFileChange}
            disabled={field.isReadOnly}
            className={`file-input ${error ? 'error' : ''}`}
            data-field-key={fieldKey}
            aria-label={field.name}
          />
          <label htmlFor={fieldKey} className="file-upload-label">
            <span className="upload-icon">🎥</span>
            <span className="upload-text">
              {field.placeholder || `Click to upload video${maxFiles > 1 ? 's' : ''}`}
            </span>
            <span className="upload-hint">
              {maxFiles > 1 ? `(Max ${maxFiles} files, ${maxSizeMB}MB each)` : `(Max ${maxSizeMB}MB)`}
            </span>
          </label>
        </div>
        {fileList.length > 0 && (
          <div className="file-preview-grid">
            {fileList.map((file, index) => getFilePreview(file, index))}
          </div>
        )}
      </div>
    );
  };

  // Don't render hidden fields
  if (field.isHidden) {
    return null;
  }

  return (
    <div className={`form-field ${field.mandatory ? 'required' : ''} ${error ? 'has-error' : ''}`}>
      <label htmlFor={fieldKey} className="field-label">
        {field.name}
        {field.mandatory && <span className="required-asterisk" aria-label="required">*</span>}
      </label>
      {renderField()}
      {error && (
        <div className="error-message" role="alert" aria-live="polite">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}
      {field.isReadOnly && (
        <div className="readonly-indicator" aria-label="This field is read-only">
          <span className="readonly-icon">🔒</span>
          Read-only field
        </div>
      )}
      {field.placeholder && !error && field.fieldType !== 'IMAGE' && field.fieldType !== 'VIDEO' && (
        <div className="field-hint">{field.placeholder}</div>
      )}
    </div>
  );
};

export default FormFieldRenderer;

