import React, { useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import RoomIcon from "@material-ui/icons/RoomOutlined";
import Typography from "@material-ui/core/Typography";
import { NavLink } from "react-router-dom";
import { assetsPath } from "./Assets";
import { sourcesPath } from "./Sources";
import { peersPath } from "./Peers";
import {
  List,
  ListItem,
  ListItemIcon,
  Divider,
  ListItemText,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Button
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    logoText: {
      display: "inline",
      fontSize: "1.1rem",
      fontWeight: 500
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        display: "none"
      }
    },
    linkButton: {
      [theme.breakpoints.down("xs")]: {
        display: "none"
      }
    },
    toolbar: theme.mixins.toolbar,
    list: {
      width: 250
    },
    fullList: {
      width: "auto"
    },
    title: {
      flexGrow: 1,
      display: "flex",
      alignItems: "center"
    }
  })
);

export default function Header() {
  const [openSide, setOpenSide] = React.useState(false);

  const toggleSide = (_open: boolean) => (e: any) => {
    if (e.type === "keydown" && (e.key === "Tab" || e.key === "Shift")) return;
    else setOpenSide(_open);
  };

  console.log({ openSide });

  const classes = useStyles();

  const routes = [
    { to: sourcesPath, name: "Sources", Icon: PlayArrowIcon },
    { to: assetsPath, name: "Assets", Icon: PlayArrowIcon },
    { to: peersPath, name: "Peers", Icon: PlayArrowIcon }
  ];

  const nameComponent = (
    <NavLink to="/" className={classes.title} style={{ color: "inherit" }}>
      <RoomIcon />
      <Typography className={classes.logoText}>IPFS Pinner</Typography>
    </NavLink>
  );

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          {nameComponent}

          {routes.map(({ to, name }) => (
            <NavLink
              className={classes.linkButton}
              to={to}
              style={{ color: "inherit" }}
            >
              <Button color="inherit">{name}</Button>
            </NavLink>
          ))}

          <IconButton
            edge="start"
            color="inherit"
            className={classes.menuButton}
            aria-label="open side"
            onClick={() => setOpenSide(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Side menu */}
      <Drawer open={openSide} onClose={toggleSide(false)}>
        <div
          className={classes.list}
          role="presentation"
          onClick={toggleSide(false)}
          onKeyDown={toggleSide(false)}
        >
          <div className={classes.toolbar}>
            <List>
              <ListItem button>{nameComponent}</ListItem>
            </List>
          </div>
          <Divider />
          <List>
            {routes.map(({ to, name, Icon }, index) => (
              <NavLink to={to} style={{ color: "inherit" }}>
                <ListItem button key={to}>
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText primary={name} />
                </ListItem>
              </NavLink>
            ))}
          </List>
        </div>
      </Drawer>
    </div>
  );
}
