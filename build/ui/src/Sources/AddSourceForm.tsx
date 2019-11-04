import React, { useState, useEffect } from "react";
import Select from "react-select";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/styles";
import { TextField, Button, Typography } from "@material-ui/core";
import * as socket from "../socket";
import { SourceOption, SourceFormInputs } from "../types";

const useStyles = makeStyles(theme => ({
  root: {
    margin: "0 auto",
    maxWidth: "30rem",
    "& > *:not(:last-child)": {
      marginBottom: "8px"
    }
  },
  addButton: {
    marginTop: "8px"
  },
  selectAndButton: {
    display: "flex"
  },
  selectContainer: {
    width: "100%"
  },
  textInput: {
    backgroundColor: "white",
    marginBottom: 0,
    "& label": { fontSize: theme.typography.fontSize },
    "& input": { fontSize: theme.typography.fontSize }
  },
  statusText: {
    margin: theme.spacing(1),
    height: theme.spacing(4)
  },
  margin: {
    margin: theme.spacing(1)
  }
}));

export default function AddAssetForm() {
  const [options, setOptions] = useState([] as SourceOption[]);
  const [type, setType] = useState("");
  const [inputs, setInputs] = useState({} as SourceFormInputs);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const currentOption = options.find(option => type && option.type === type);
  const fields = currentOption ? currentOption.fields || [] : [];

  useEffect(() => {
    socket
      .getOptions(undefined)
      .then(setOptions)
      .catch(e => console.error(`Error getting options: ${e.stack}`));
  }, []);

  async function addSource() {
    try {
      if (!type) throw Error("Must select a type first");
      validateForm();

      setLoading(true);
      setStatusText(`Adding source ${type}`);
      console.log("Adding source", inputs, type);
      const cacheInputs = JSON.stringify(inputs);

      await socket.addSource({ ...inputs, type });
      setStatusText(`Successfully added ${type}`);
      // Clean only if the inputs have not changed
      if (cacheInputs === JSON.stringify(inputs)) setInputs({});
    } catch (e) {
      setStatusText(e.message);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    for (const field of fields) {
      const value = inputs[field.id];
      if (field.required && !value) throw Error(`${field.label} is required`);
    }
  }

  const classes = useStyles();
  const theme: any = useTheme();
  const textColor = theme.palette.text.secondary;

  // To keep the three elements at a consistent height
  const height = "40px";

  return (
    <div className={classes.root}>
      <div className={classes.selectAndButton}>
        <div className={classes.selectContainer}>
          <Select
            // defaultValue={options[0]}
            // defaultMenuIsOpen={true}
            // react-select can't work with this handler, it must use any to compile
            onChange={(option: any) => {
              setStatusText("");
              setType(option.value);
            }}
            styles={{
              menu: provided => ({
                ...provided,
                // z-index must be higher than the material-table header
                zIndex: 200
              }),
              control: provided => ({
                ...provided,
                height
              }),
              placeholder: provided => ({
                ...provided,
                color: textColor
              })
            }}
            options={options.map(({ type, label }) => ({
              value: type,
              label
            }))}
          />
        </div>
      </div>

      {fields.map(field => (
        <TextField
          key={field.id}
          label={field.label}
          className={classes.textInput}
          InputProps={{ style: { height } }}
          onKeyPress={e => {
            if (e.key === "Enter") addSource();
          }}
          value={inputs[field.id] || ""}
          onChange={e => {
            const value = e.target.value;
            setStatusText("");
            setInputs(_inputs => ({ ..._inputs, [field.id]: value }));
          }}
          fullWidth
          margin="dense"
          variant="outlined"
        />
      ))}

      {currentOption && (
        <div className={classes.addButton}>
          <Button
            onClick={addSource}
            disabled={loading}
            variant="contained"
            color="primary"
            style={{ whiteSpace: "nowrap", color: "white", height }}
            fullWidth
          >
            Add
          </Button>
        </div>
      )}

      <Typography
        className={classes.statusText}
        align="center"
        color="textSecondary"
      >
        {statusText}
      </Typography>
    </div>
  );
}
