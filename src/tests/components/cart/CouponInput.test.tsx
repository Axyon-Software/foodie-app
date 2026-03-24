
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import CouponInput from '../../../components/cart/CouponInput';

describe('CouponInput', () => {
    it('should render input field', () => {
        render(<CouponInput />);

        expect(screen.getByPlaceholderText(/cupom/i)).toBeInTheDocument();
    });

    it('should render apply button', () => {
        render(<CouponInput />);

        expect(screen.getByRole('button', { name: /aplicar/i })).toBeInTheDocument();
    });

    it('should disable button when input is empty', () => {
        render(<CouponInput />);

        const button = screen.getByRole('button', { name: /aplicar/i });
        expect(button).toBeDisabled();
    });

    it('should enable button when input has value', async () => {
        const { user } = render(<CouponInput />);

        const input = screen.getByPlaceholderText(/cupom/i);
        await user.type(input, 'PRIMEIRA');

        const button = screen.getByRole('button', { name: /aplicar/i });
        expect(button).not.toBeDisabled();
    });

    it('should convert input to uppercase', async () => {
        const { user } = render(<CouponInput />);

        const input = screen.getByPlaceholderText(/cupom/i);
        await user.type(input, 'primeira');

        expect(input).toHaveValue('PRIMEIRA');
    });
});