import React from "react";
import PropTypes from "prop-types";
// @material-ui/core components
import {makeStyles, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
i
// core components
import styles from "assets/jss/material-dashboard-react/components/tableStyle.js";

const useStyles = makeStyles(styles);

export default function CustomTable(props) {
    const classes = useStyles();
    const {tableHead, tableData, tableHeaderColor} = props;
    return (
        <div className={classes.tableResponsive}>
            <Table className={classes.table}>
                {tableHead !== undefined ? (
                    <TableHead className={classes[tableHeaderColor + "TableHeader"]}>
                        <TableRow className={classes.tableHeadRow}>
                            {tableHead.map((prop, key) => {
                                return (
                                    <TableCell
                                        className={classes.tableCell + " " + classes.tableHeadCell}
                                        key={key}
                                    >
                                        {prop}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                ) : null}
                <TableBody>
                    {tableData.map((prop, key) => {
                        return (
                            <TableRow key={key} className={classes.tableBodyRow}>
                                {prop.map((prop, key) => {
                                    return (
                                        <TableCell className={classes.tableCell} key={key}>
                                            {prop}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

CustomTable.defaultProps = {
    tableHeaderColor: "gray"
};

CustomTable.propTypes = {
    tableHeaderColor: PropTypes.oneOf([
        "warning",
        "primary",
        "danger",
        "success",
        "info",
        "rose",
        "gray"
    ]),
    tableHead: PropTypes.arrayOf(PropTypes.string),
    tableData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
};
