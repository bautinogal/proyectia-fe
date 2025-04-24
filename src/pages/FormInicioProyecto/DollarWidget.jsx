import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

const DollarWidget = ({ id, value, required, disabled, readonly, label, onChange }) => {
  return (
    <TextField
      id={id}
      label={label}
      value={value ?? ""}
      required={required}
      disabled={disabled}
      InputProps={{
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
        readOnly: readonly,
      }}
      fullWidth
      onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))}
      type="number"
      variant="outlined"
    />
  );
};

export default DollarWidget;
