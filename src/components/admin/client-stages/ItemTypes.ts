
export const ItemTypes = {
  CLIENT_CARD: 'client_card'
};

// Define types for drag items to ensure proper typing
export interface ClientDragItem {
  id: string;
  currentStatus: string;
}
