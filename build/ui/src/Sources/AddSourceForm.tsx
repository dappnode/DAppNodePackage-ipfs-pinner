import React, { useState, useEffect } from "react";
import Select from "react-select";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import socket from "../socket";
import { SourceType, SourceOptionsApi } from "../types";

const useStyles = makeStyles(theme => ({
  root: {
    margin: "0 auto",
    maxWidth: "40rem"
  },
  selectAndButton: {
    display: "flex"
  },
  selectContainer: {
    width: "100%",
    marginRight: theme.spacing(2)
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
  const [options, setOptions] = useState([] as SourceOptionsApi);
  const [type, setType] = useState("" as SourceType);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    socket.emit("options", (res: any) => {
      if (res.error) console.error(`Error on fetchOptions: ${res.error}`);
      else setOptions(res.data);
    });
  }, []);

  // react-select types are impossible to comply with this handler
  // it must use any to compile
  function handleSelectChange(option: any) {
    setType(option.value as SourceType);
  }

  async function addSource() {
    setLoading(true);
    console.log(`Adding source ${type} ${name}`);
    socket.emit("addSource", type, name, (res: any) => {
      setLoading(false);
      console.log("Added source", res);
      if (res.error) setStatusText(res.error);
      else setStatusText(`Successfully added ${name}`);
    });
  }

  function getPlaceholder() {
    if (!type) return "Select a type first";
    const currentOption = options.find(option => option.value === type);
    if (currentOption) return currentOption.placeholder || "Name";
    else return "Name";
  }

  const classes = useStyles();
  const theme: any = useTheme();
  const textColor = theme.palette.text.secondary;

  // To keep the three elements at a consistent height
  const height = "40px";

  return (
    <div className={classes.root}>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} sm={6}>
          <TextField
            id="outlined-name"
            label={getPlaceholder()}
            className={classes.textInput}
            InputProps={{
              style: { height }
            }}
            onKeyPress={e => {
              if (e.key === "Enter") addSource();
            }}
            value={name}
            onChange={e => {
              setStatusText("");
              setName(e.target.value);
            }}
            fullWidth
            margin="dense"
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <div className={classes.selectAndButton}>
            <div className={classes.selectContainer}>
              <Select
                // defaultValue={options[0]}
                // defaultMenuIsOpen={true}
                onChange={handleSelectChange}
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
                options={options}
              />
            </div>
            <Button
              onClick={addSource}
              disabled={loading}
              variant="contained"
              color="primary"
              style={{ whiteSpace: "nowrap", color: "white", height }}
            >
              Add
            </Button>
          </div>
        </Grid>
      </Grid>
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
