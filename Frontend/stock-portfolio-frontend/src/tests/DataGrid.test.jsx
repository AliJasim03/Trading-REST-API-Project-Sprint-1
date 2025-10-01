import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import DataGrid from "../components/ui/DataGrid";

    vi.mock('ag-grid-react', () => ({
        AgGridReact: (props) => 
        <div data-testid="ag-grid">
            {JSON.stringify(props.rowData)}
        </div>
    }))

describe('DataGrid', () => {

    const sampleData = [
            { id: 1, name: "John Doe"},
            { id: 2, name: "Jane Doe"},
        ];
        const sampleColumns = [
            { field: "name" },
        ];

    it('should render the empty dataset message', () => {
        render(<DataGrid data={[]} columns={[]} />);
        expect(screen.getByText("No data available")).toBeInTheDocument();
    })
    it("should not display the empty dataset message if data was provided", ()=>{
        
        render(<DataGrid data={sampleData} columns={sampleColumns} />);
        expect(screen.queryByText("No data available")).not.toBeInTheDocument();
    })
    it("should display the grid with data provided", ()=>{
        render(<DataGrid data={sampleData} columns={sampleColumns} />);
        expect(screen.getByTestId("ag-grid")).toHaveTextContent(JSON.stringify(sampleData));
    })
})