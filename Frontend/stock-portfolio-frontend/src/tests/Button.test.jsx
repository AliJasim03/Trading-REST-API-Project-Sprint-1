import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, afterEach} from 'vitest';
import userEvent from '@testing-library/user-event';
import Button from '../components/ui/Button';

describe('Button', () => {
    it('should render the button with the correct text', () => {
        render(<Button>Test Button</Button>);
        const buttonElement = screen.getByRole('button', { name: 'Test Button' });
        expect(buttonElement).toBeInTheDocument();
    })
    it("is disabled when loading", () => {
        render(<Button loading>Test Button</Button>);
        const button = screen.getByText("Test Button").closest("button");
        expect(button).toBeDisabled();
    });
    it("should not call onClick when loading", () => {
        const onClick = vi.fn();
        render(<Button loading onClick={onClick}>Test Button</Button>);
        const button = screen.getByText("Test Button").closest("button");
        fireEvent.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });
    it("should not call onClick when disabled", () => {
        const onClick = vi.fn();
        render(<Button disabled onClick={onClick}>Test Button</Button>);
        const button = screen.getByText("Test Button").closest("button");
        fireEvent.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });
    it("should call onClick when not loading or disabled", () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Test Button</Button>);
        const button = screen.getByText("Test Button").closest("button");
        fireEvent.click(button);
        expect(onClick).toHaveBeenCalled();
    })
    it("should apply variants and sizes set by the call", ()=>{
        render(<Button variant="secondary" size="lg">Test Button</Button>);
        const button = screen.getByText("Test Button").closest("button");
        expect(button).toHaveClass("bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100");
        expect(button).toHaveClass("px-6 py-3 text-lg");
    })
})