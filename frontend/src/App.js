import React from "react";
import Header from "./components/header";
import ProductoList from "./components/ProductoList";

function App() {
  return (
    <>
      <Header />

      <main style={{ padding: "2rem" }}>
        <ProductoList />
      </main>
    </>
  );
}

export default App;
