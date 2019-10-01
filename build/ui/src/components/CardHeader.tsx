import React from "react";
// Material UI components
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { NavLink } from "react-router-dom";
import RightArrowIcon from "@material-ui/icons/ChevronRight";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      padding: theme.spacing(3, 3)
    },
    boxButton: {
      padding: theme.spacing(3, 3)
    },
    boxHeader: {
      padding: theme.spacing(2, 2),
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #dfdfdf"
    },
    boxTitle: {
      fontWeight: 600
    },
    boxSubTitle: {
      color: "#66788A"
    },
    buttonNav: {
      margin: "-8px"
    },
    buttonNavEl: {
      display: "flex",
      color: theme.palette.text.secondary
    }
  })
);

const CardHeader = ({
  title,
  subtitle,
  to,
  toText
}: {
  title: string;
  subtitle?: string;
  to?: string;
  toText?: string;
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.boxHeader}>
      <Typography className={classes.boxTitle}>{title}</Typography>
      {subtitle ? (
        <Typography className={classes.boxSubTitle}>{subtitle}</Typography>
      ) : to ? (
        <NavLink to={to || ""}>
          <Button className={classes.buttonNav}>
            <span className={classes.buttonNavEl}>{toText}</span>
            <span className={classes.buttonNavEl}>
              <RightArrowIcon />
            </span>
          </Button>
        </NavLink>
      ) : null}
    </Box>
  );
};

export default CardHeader;
