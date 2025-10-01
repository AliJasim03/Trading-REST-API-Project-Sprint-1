import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import OrderPerformanceStats from "../components/dashboard/OrderPerformanceStats";

describe("Order Performance Stats", ()=>{
    it('should load when loading the data', async ()=>{
        render(<OrderPerformanceStats loading ={true}/>)
        expect( await screen.findAllByText(/Loading.../i)).not.toBe(null);
    })
    it('should show the data if loading is complete',  ()=>{
        render(<OrderPerformanceStats stats={{totalOrders: 120, pendingOrders: 30, filledOrders: 90}} loading= {false}/>)
        expect(screen.getByText('120')).toBeInTheDocument()
        expect(screen.getByText('30')).toBeInTheDocument()
        expect(screen.getByText('90')).toBeInTheDocument()

    })
})