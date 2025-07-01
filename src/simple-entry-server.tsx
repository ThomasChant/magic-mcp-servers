import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import SimpleApp from "./SimpleApp";

export function render(url: string) {
    const html = renderToString(
        <React.StrictMode>
            <MemoryRouter initialEntries={[url]}>
                <SimpleApp />
            </MemoryRouter>
        </React.StrictMode>
    );
    return { html };
}