import {render, screen, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, afterEach} from 'vitest';
import userEvent from '@testing-library/user-event';
import Dialog from '../components/dialog/Dialog';
import { wait } from '@testing-library/user-event/dist/cjs/utils/index.js';

describe ('Dialog', () => {
    it('should render the dialog window', ()=>{
        render(<Dialog isOpen = {true}>Test Dialog</Dialog>);
        const dialog = screen.getByText("Test Dialog");
        expect(dialog).toBeInTheDocument();
    })

    it('should not render if isOpen is false', ()=>{
        render(<Dialog isOpen = {false}>Test Dialog</Dialog>);
        const dialog = screen.queryByText("Test Dialog");
        expect(dialog).not.toBeInTheDocument();
    })

    it('should render the close button', ()=>{
        render(<Dialog isOpen = {true}>Test Dialog</Dialog>);
        const close = screen.getByRole("button");
        expect(close).toBeInTheDocument();
    })
    it('should close on clicking close button', async ()=>{
        const onClose = vi.fn();
        render(<Dialog isOpen = {true} onClose={onClose} showCloseButton={true}>Test Dialog</Dialog>);
        const user =userEvent.setup()
        await user.click(screen.getByRole("button"));
        await waitFor(() =>{
            expect(onClose).toHaveBeenCalled();
        })
    })
    it('should not close on clicking close button if showCloseButton is false', ()=>{
        render(<Dialog isOpen = {true} showCloseButton={false}>Test Dialog</Dialog>);
        const buttonElement = screen.queryByRole("button");
        expect(buttonElement).not.toBeInTheDocument();
    })
    it('should close on clicking overlay', async ()=>{
        const onClose = vi.fn();
        render(<Dialog isOpen = {true} showCloseButton={false} onClose={onClose}><button >Test Dialog</button></Dialog>);
        const user = userEvent.setup()
        await user.click(screen.getByTestId("dialog-overlay"));
        await waitFor(() =>{
            expect(onClose).toHaveBeenCalled();
        })
    })
    it('should close on escape button', async()=>
    {
        const onClose = vi.fn();
        render(<Dialog isOpen = {true} showCloseButton={false} onClose={onClose}>Test Dialog</Dialog>);
        const user = userEvent.setup()
        await user.keyboard('{Escape}');
        await waitFor(() =>{
            expect(onClose).toHaveBeenCalled();
        })
    })
})