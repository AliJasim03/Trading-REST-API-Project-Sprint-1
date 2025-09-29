import { render, screen, waitFor, fireEvent, toBe} from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Select from '../components/ui/Select';


describe('Select', ()=>{
    it("should render the input component", ()=>{
        render(<Select />);
        const input = screen.getByRole("combobox");
        expect(input).toBeInTheDocument();
    })

    it("should render the the label", ()=>{
        render (<Select label="Test Input" id={1} />);
        const input = screen.getByLabelText("Test Input");
        expect(input).toBeInTheDocument();
    })
    it("should render  of the select", ()=> {
        render(
            <Select label="Test" multiple data-testid="test-select">
                    <option value="apple">apple</option>
                    <option value="banana">banana</option>
                    <option value="cherry">cherry</option>
            </Select>
        )
        const select = screen.getByTestId("test-select");
        fireEvent.change(select, {target: {value: "apple"}});
        expect(select.value).toBe("apple");
    })
    it("should render the error message if error is provided", ()=>{
        render(<Select error="Test Error" />);
        const error = screen.getByText("Test Error");
        expect(error).toBeInTheDocument();
    })
})