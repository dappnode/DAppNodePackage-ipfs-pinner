import React, { useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import RoomOutlineIcon from "@material-ui/icons/RoomOutlined";
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
import RssFeedIcon from "@material-ui/icons/RssFeed";
import RoomIcon from "@material-ui/icons/Room";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";

const topBarHeight = 6;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    topToolbar: {
      height: theme.spacing(topBarHeight)
    },
    sideTopBar: {
      height: theme.spacing(topBarHeight)
    },
    logoText: {
      display: "inline",
      fontSize: "1.1rem",
      fontWeight: 600
    },
    logoIcon: {
      color: theme.palette.primary.main,
      fontSize: "30px"
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
  const [openSide, setOpenSide] = useState(false);

  const toggleSide = (_open: boolean) => (e: any) => {
    if (e.type === "keydown" && (e.key === "Tab" || e.key === "Shift")) return;
    else setOpenSide(_open);
  };

  const classes = useStyles();

  const routes = [
    { to: sourcesPath, name: "Sources", Icon: RssFeedIcon },
    { to: assetsPath, name: "Assets", Icon: RoomIcon },
    { to: peersPath, name: "Peers", Icon: DeviceHubIcon }
  ];

  const nameComponent = (
    <NavLink to="/" className={classes.title} style={{ color: "inherit" }}>
      <RoomOutlineIcon className={classes.logoIcon} />
      <Typography className={classes.logoText}>IPFS Pinner</Typography>
    </NavLink>
  );

  return (
    <div className={classes.root}>
      <AppBar position="fixed" color="secondary">
        <Toolbar className={classes.topToolbar}>
          {nameComponent}

          {routes.map(({ to, name }) => (
            <NavLink
              key={to}
              to={to}
              className={classes.linkButton}
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
      <Drawer open={openSide} onClose={toggleSide(false)} color="secondary">
        <div
          className={classes.list}
          role="presentation"
          onClick={toggleSide(false)}
          onKeyDown={toggleSide(false)}
        >
          <div className={classes.toolbar}>
            <List className={classes.sideTopBar}>
              <ListItem button>{nameComponent}</ListItem>
            </List>
          </div>
          <Divider />
          <List>
            {routes.map(({ to, name, Icon }, index) => (
              <NavLink key={to} to={to} style={{ color: "inherit" }}>
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
