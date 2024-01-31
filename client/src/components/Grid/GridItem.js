import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @material-ui/core components
import {makeStyles} from "@mui/material";
import Grid from "@mui/material/Grid";

const styles = {
    grid: {
        padding: "0 15px !important"
    }
};

const useStyles = makeStyles(styles);

export default function GridItem(props) {
    const classes = useStyles();
    const {children, ...rest} = props;
    return (
        <Grid item {...rest} className={classes.grid}>
            {children}
        </Grid>
    );
}

GridItem.propTypes = {
    children: PropTypes.node
};
