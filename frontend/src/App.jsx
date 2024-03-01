import { Route, Routes } from "react-router-dom";
import { createTheme } from "@mui/material/styles";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";

import LearnPage from "./components/LearnPage";
import HomePage from "./components/HomePage";
import AdvancedPage from "./components/AdvancedPage";
import AboutPage from "./components/AboutPage";
import AssemblyMember from "./components/AssemblyMember";
import Senator from "./components/Senator";

import "./index.css";
import BillList from "./components/BillList";
import Bill from "./components/Bill";
import Header from "./components/Header";
import Footer from "./components/Footer";

const THEME = createTheme({
  typography: {
    fontFamily: `"Fjalla One", "Roboto", "Helvetica", "Arial", sans-serif`,
  },
});

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={THEME}>
        <Header />
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />}></Route>
            <Route path="/bills" element={<BillList />}></Route>
            <Route path="/learn" element={<LearnPage />}></Route>
            <Route path="/advanced" element={<AdvancedPage />}></Route>
            <Route path="/about" element={<AboutPage />}></Route>
            <Route
              path="/assembly/:memberName"
              element={<AssemblyMember />}
            ></Route>
            <Route path="/senate/:senatorName" element={<Senator />}></Route>
            <Route
              path="/bill/:sessionYear/:printNo"
              element={<Bill />}
            ></Route>
          </Routes>
        </div>
        <Footer />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
