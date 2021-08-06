/*!

=========================================================
* Material Dashboard React - v1.9.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import {createBrowserHistory} from "history";
import {Router, Route, Switch, Redirect} from "react-router-dom";

// core components
import Admin from "layouts/Admin.js";
// import RTL from "layouts/RTL.js";

import "assets/css/font-awesome.min.css";
import "assets/css/material-dashboard-react.css?v=1.9.0";
import "assets/css/deepphe.css";
import "assets/css/normalize.css";

import Patient from "./views/Patient/Patient";
import CancerAndTumorSummaryView from "./views/Summaries/CancerAndTumorSummaryView";
import TimelineView from "./views/Timeline/TimelineView";
import ReactDOM from "react-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import {CssBaseline} from "@material-ui/core";
import {createMuiTheme, ThemeProvider} from "@material-ui/core";
import Footer from "./components/Footer/Footer";

const hist = createBrowserHistory();
const themeLight = createMuiTheme({
    palette: {
        background: {
            default: "#e4f0e2"
        }
    }
});

const themeDark = createMuiTheme({
    palette: {
        background: {
            default: "#f5f5f5",
            secondary:"#333"
        },
        text: {
            primary: "#ffffff"
        },

    },

    typography: {
        // In Chinese and Japanese the characters are usually larger,
        // so a smaller fontsize may be appropriate.
        fontSize: 26,
        htmlFontSize: 26
    }
});


ReactDOM.render(
    <Router history={hist}>
        <ThemeProvider theme={themeDark}>
            <CssBaseline/>
            <Switch>
                <Route path="/admin" component={Admin}/>
                <Route path="/patient/:patientId/cancerAndTumorSummary" component={CancerAndTumorSummaryView}/>
                <Route path="/patient/:patientId/timeline" component={TimelineView}/>
                <Route path="/patient/:patientId" component={Patient}/>

                <Redirect from="/" to="/admin/dashboard"/>
            </Switch>
        </ThemeProvider>
    </Router>
    ,
    document.getElementById("root")
);


