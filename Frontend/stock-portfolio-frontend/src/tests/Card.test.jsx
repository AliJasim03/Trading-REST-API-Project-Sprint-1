import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Card from '../components/ui/Card.jsx';

describe("Card", () => {
    it("should render the card", () => {
        render(<Card>Test Card</Card>);
        const cardElement = screen.getByText("Test Card");
        expect(cardElement).toBeInTheDocument();
    })
    it("forwards additional props", () => {
        render(<Card id="my-card" data-testid="card" />);
        const card = screen.getByTestId("card");
        expect(card).toHaveAttribute("id", "my-card");
    });

    it("accepts additional className", () => {
        render(<Card className="custom-class" data-testid="card" />);
        const card = screen.getByTestId("card");
        expect(card.className).toContain("custom-class");
    });

})