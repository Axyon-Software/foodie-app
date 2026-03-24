import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import MenuItemModal from '../../../components/restaurant/MenuItemModal';
import { mockMenuItem } from '../../utils/mock-data';

describe('MenuItemModal', () => {
    const defaultProps = {
        item: mockMenuItem,
        isOpen: true,
        onClose: vi.fn(),
    };

    it('should not render when closed', () => {
        render(<MenuItemModal {...defaultProps} isOpen={false} />);

        expect(screen.queryByText(mockMenuItem.name)).not.toBeInTheDocument();
    });

    it('should render item name when open', () => {
        render(<MenuItemModal {...defaultProps} />);

        expect(screen.getByText(mockMenuItem.name)).toBeInTheDocument();
    });

    it('should render item description', () => {
        render(<MenuItemModal {...defaultProps} />);

        expect(screen.getByText(mockMenuItem.description)).toBeInTheDocument();
    });

    it('should render item price', () => {
        render(<MenuItemModal {...defaultProps} />);


        const priceElements = screen.getAllByText(/29,90/);
        expect(priceElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should start with quantity 1', () => {
        render(<MenuItemModal {...defaultProps} />);

        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should increment quantity', async () => {
        const { user } = render(<MenuItemModal {...defaultProps} />);

        const incrementButton = screen.getByLabelText(/aumentar/i);
        await user.click(incrementButton);

        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should decrement quantity', async () => {
        const { user } = render(<MenuItemModal {...defaultProps} initialQuantity={3} />);

        const decrementButton = screen.getByLabelText(/diminuir/i);
        await user.click(decrementButton);

        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should not go below 1', async () => {
        const { user } = render(<MenuItemModal {...defaultProps} />);

        const decrementButton = screen.getByLabelText(/diminuir/i);
        await user.click(decrementButton);

        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should update total price with quantity', async () => {
        const { user } = render(<MenuItemModal {...defaultProps} />);

        const incrementButton = screen.getByLabelText(/aumentar/i);
        await user.click(incrementButton);


        const priceElements = screen.getAllByText(/59,80/);
        expect(priceElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should call onClose when close button clicked', async () => {
        const onClose = vi.fn();
        const { user } = render(<MenuItemModal {...defaultProps} onClose={onClose} />);

        const closeButton = screen.getByLabelText(/fechar/i);
        await user.click(closeButton);

        expect(onClose).toHaveBeenCalled();
    });

    it('should render observation textarea', () => {
        render(<MenuItemModal {...defaultProps} />);

        expect(screen.getByPlaceholderText(/cebola/i)).toBeInTheDocument();
    });

    it('should show Popular badge', () => {
        render(<MenuItemModal {...defaultProps} />);

        expect(screen.getByText(/popular/i)).toBeInTheDocument();
    });
});