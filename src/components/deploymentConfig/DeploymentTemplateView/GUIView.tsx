import React, { useState} from 'react';
import YAML from 'yaml';
import { convertSchemaJsonToMap, getAndUpdateSchemaValue } from '../../v2/values/chartValuesDiff/ChartValuesView.utils'
import ChartValuesGUIForm from '../../v2/values/chartValuesDiff/ChartValuesGUIView';


interface GUIViewProps {
  schema: any
  yamlValue: string
  onChange: (yamlValues: string) => void
}

const GUIView = (props: GUIViewProps) => {
  const [schemaJSON, setSchemaJSON] = useState(getAndUpdateSchemaValue(props.yamlValue|| "", convertSchemaJsonToMap(JSON.stringify(props.schema)), () => {}))

  const handleDispatch = (event: any) => {
    if (event.type !== 'multipleOptions') return;

    if (event.payload.modifiedValuesYaml) {
      props.onChange(event.payload.modifiedValuesYaml)
    }
    if (event.payload.schemaJson) {
      setSchemaJSON(event.payload.schemaJson);
    }
  }

  return (
      <div className="pt-8 pl-16 pr-16" style={{overflow: 'hidden'}}>
        <ChartValuesGUIForm
          schemaJson={schemaJSON}
          valuesYamlDocument={YAML.parseDocument(props.yamlValue || "")}
          fetchingSchemaJson={false}
          openReadMe={false}
          isUpdateInProgress={false}
          isDeleteInProgress={false}
          isDeployChartView={false}
          isCreateValueView={true}
          deployOrUpdateApplication={() => Promise.resolve()}
          dispatch={handleDispatch}
          formValidationError={{}}
          showSubmitButton={false}
        />
      </div>
      )
}

export default GUIView
