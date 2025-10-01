import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Input from '../components/ui/Input';

describe('input', ()=>{
    it("should render the the label", ()=>{
        render (<Input label="Test Input" id={1} />);
        const input = screen.getByLabelText("Test Input");
        expect(input).toBeInTheDocument();
    })
    it("should render the input component", ()=>{
        render(<Input />);
        const input = screen.getByRole("textbox");
        expect(input).toBeInTheDocument();
    })
    it("should render the error message if error is provided", ()=>{
        render(<Input error="Test Error" />);
        const error = screen.getByText("Test Error");
        expect(error).toBeInTheDocument();
    })
})