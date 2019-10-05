import { createMuiTheme } from "@material-ui/core/styles";

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#00d395",
      dark: "#02bb85"
      // #00d395
    },
    secondary: {
      main: "#141e27",
      light: "#0f8bff",
      dark: "#116be0"
    },
    // error: {
    //   main: red.A400
    // },
    // background: {
    //   default: "#fff",
    //   paper: "#293640"
    // },
    text: {
      primary: "#141e27",
      secondary: "#66788A"
    }
  },
  typography: {
    h6: {
      fontWeight: 400
    }
  }
});

console.log(theme);

export default theme;
