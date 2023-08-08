import React, { useState } from "react";

import DefaultModal from "components/Modal";
import { Textarea, Input } from "components/Inputs";
import { Form } from "styles/Form.style";
import Switch from "components/Switch";

function SummaryPanelAIConfig({ open, setOpen, payload, reload }) {
  const [currentConfig, setCurrentConfig] = useState({
    ...payload,
    do_sample: true,
  });

  const handleOK = () => {
    setOpen(false);
    reload(currentConfig);
  };

  const onChangeMessage = (value, index) => {
    const config = { ...currentConfig };
    config.messages = [...currentConfig.messages];
    config.messages[index] = { ...config.messages[index] };
    config.messages[index].content = value;

    setCurrentConfig(config);
  };

  return (
    <DefaultModal
      width={700}
      centered
      destroyOnClose
      onOk={handleOK}
      onCancel={() => setOpen(false)}
      open={open}
    >
      <Form>
        {currentConfig &&
          currentConfig.messages.map((m, index) => (
            <div className={`form-row`} key={index}>
              <div className="form-label">
                <label>{m.role}:</label>
              </div>
              <div className="form-input">
                <Textarea
                  value={m.content}
                  style={{ minHeight: "150px" }}
                  onChange={({ target }) =>
                    onChangeMessage(target.value, index)
                  }
                ></Textarea>
              </div>
            </div>
          ))}

        <div className={`form-row`}>
          <div className="form-label">
            <label>temperature:</label>
          </div>
          <div className="form-input">
            <Input
              value={currentConfig.temperature}
              onChange={({ target }) =>
                setCurrentConfig({
                  ...currentConfig,
                  temperature: target.value,
                })
              }
            ></Input>
          </div>
        </div>

        <div className={`form-row`}>
          <div className="form-label">
            <label>top_p:</label>
          </div>
          <div className="form-input">
            <Input
              value={currentConfig.top_p}
              onChange={({ target }) =>
                setCurrentConfig({
                  ...currentConfig,
                  top_p: target.value,
                })
              }
            ></Input>
          </div>
        </div>

        <div className={`form-row`}>
          <div className="form-label">
            <label>do_sample:</label>
          </div>
          <div className="form-input">
            <Switch
              onChange={(active) =>
                setCurrentConfig({ ...currentConfig, do_sample: active })
              }
              checked={currentConfig.do_sample}
            ></Switch>
          </div>
        </div>
      </Form>
    </DefaultModal>
  );
}

export default SummaryPanelAIConfig;
