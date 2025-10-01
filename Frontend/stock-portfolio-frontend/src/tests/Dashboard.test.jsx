import {describe, it, expect, vi} from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "../pages/Dashboard";

describe('Dashboard', () => {
    it('should load when loading the data', async ()=>{
        render(<Dashboard loading ={true}/>)
        expect( await screen.findByText(/Loading dashboard.../i)).toBeInTheDocument();
    })
})