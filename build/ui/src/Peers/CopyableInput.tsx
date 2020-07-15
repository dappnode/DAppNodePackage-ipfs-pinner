import React, { useState } from "react";
import { TextField, Tooltip, Button } from "@material-ui/core";
import copy from "copy-to-clipboard";
import { makeStyles } from "@material-ui/core/styles";

// To keep the three elements at a consistent height
export const copyableInputHeight = "40px";

const useStyles = makeStyles(theme => ({
  appendedButton: {
    marginTop: "8px"
  },
  input: {
    marginRight: theme.spacing(2)
  },
  inputGroup: {
    display: "flex"
  }
}));

export function CopyableInput({ text }: { text: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  function onCopy() {
    copy(text);
    setShowTooltip(true);
  }

  const classes = useStyles();

  return (
    <Tooltip
      open={showTooltip}
      title={"Copied to clipboard!"}
      leaveDelay={1500}
      onClose={() => setShowTooltip(false)}
    >
      <div className={classes.inputGroup}>
        <TextField
          className={classes.input}
          onClick={onCopy}
          InputProps={{
            readOnly: true,
            disabled: true
          }}
          value={text}
          fullWidth
          margin="dense"
          variant="outlined"
        />
        <Button
          className={classes.appendedButton}
          onClick={onCopy}
          variant="contained"
          style={{ height: copyableInputHeight }}
        >
          Copy
        </Button>
      </div>
    </Tooltip>
  );
}
