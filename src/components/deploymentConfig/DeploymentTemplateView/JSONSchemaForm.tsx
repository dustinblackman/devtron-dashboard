import React from 'react';
import YAML from 'yaml';

import Form from "react-jsonschema-form";

interface JSONSchemaFormType {
  onChange: (yaml: string) => void;
  value?: string;
  schemaJson: any
}

function JSONSchemaForm({ value, schemaJson, onChange }: JSONSchemaFormType) {
  const handleOnChange = ({ formData }: { formData: any }) => {
    console.log("ON CHANGE", formData)
    const yamlString = YAML.stringify(formData)
    console.log("ON CHANGE yamlString", yamlString)
    // onChange(yamlString);
  }

  console.log('VALUE', value)

  // let parsedValue: any = undefined
  // if (value) {
  //   try {
  //     parsedValue = YAML.parse(value);
  //   } catch(err) {
  //     console.error('Failed to parse, skipping', err);
  //   }
  // }
  //
  // console.log('PARSED', parsedValue)

  return (
    <Form
      schema={schemaJson}
      // formData={parsedValue}
      onChange={handleOnChange}
    >
      <span>/</span>
    </Form>
  );
}

export default JSONSchemaForm;
