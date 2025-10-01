import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import StatusBadge from '../components/ui/StatusBadge';

describe('StatusBadge', ()=>{
    it("Should contain proper text", ()=>{
        render(<StatusBadge status={0} />);
        const text = screen.getByText("Pending");
        expect(text).toBeInTheDocument();
    })
})