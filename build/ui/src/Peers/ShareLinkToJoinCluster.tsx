import React, { useState } from "react";
import { TextField, Tooltip, Button, LinearProgress } from "@material-ui/core";
import copy from "copy-to-clipboard";
import { getUrlToShare } from "./configClusterUtils";

function CopyableInput({ text }: { text: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  function onCopy() {
    copy(text);
    setShowTooltip(true);
  }

  return (
    <Tooltip
      open={showTooltip}
      title={"Copied to clipboard!"}
      leaveDelay={1500}
      onClose={() => setShowTooltip(false)}
    >
      <TextField
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
    </Tooltip>
  );
}

export default function ShareLinkToJoinCluster({
  yourMultiaddress,
  yourSecret,
  generatingSecret,
  loadingSecret,
  generateSecret
}: {
  yourMultiaddress: string;
  yourSecret: string;
  generatingSecret: boolean;
  loadingSecret: boolean;
  generateSecret: () => void;
}) {
  return (
    <div>
      <div>
        {yourMultiaddress ? (
          yourSecret ? (
            <>
              Share this link with a trusted peer to join your cluster
              <CopyableInput
                text={getUrlToShare(yourSecret, yourMultiaddress)}
              />
              In case other peers cannot connect to you, make sure your
              multiaddress is correct: {yourMultiaddress}
            </>
          ) : generatingSecret ? (
            <>
              Generating secret to start your cluster...
              <LinearProgress />
            </>
          ) : loadingSecret ? (
            <>
              Loading secret...
              <LinearProgress />
            </>
          ) : (
            <>
              To be able to invite other peers to your cluster, first generate a
              cluster secret
              <Button
                onClick={generateSecret}
                disabled={generatingSecret}
                variant="contained"
                color="primary"
                style={{ whiteSpace: "nowrap", color: "white" }}
              >
                Generate secret
              </Button>
            </>
          )
        ) : (
          <>
            Loading multiaddress...
            <LinearProgress />
          </>
        )}
      </div>
    </div>
  );
}
