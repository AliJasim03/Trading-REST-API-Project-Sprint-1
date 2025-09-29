import {render, screen, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, afterEach} from 'vitest';
import userEvent from '@testing-library/user-event';
import Loading from '../components/ui/Loading';

describe('Loading', () => {
    it('should always render the loading spinner', () => {
        const {container} = render(<Loading />);
        const spinner = container.querySelector('svg');
        expect(spinner).toBeInTheDocument();
    })

    it('does not render text if not provided'), () => {
        render(<Loading />);
        const loadingText = screen.queryByText('.');
        expect(loadingText).not.toBeInTheDocument();
    }
    it('should render the loading text if provided', () => {
        render(<Loading text="Loading..." />);
        const loadingText = screen.getByText('Loading...');
        expect(loadingText).toBeInTheDocument();
    })


})