const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/clientController');
const ContactController = require('../controllers/contactController');
const InteractionController = require('../controllers/interactionController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const clientController = new ClientController();
const contactController = new ContactController();
const interactionController = new InteractionController();

// Public routes (if any)
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Client Service is running',
    timestamp: new Date().toISOString()
  });
});

// Protected routes - require authentication
router.use(authMiddleware);

// ===== CLIENT ROUTES =====

// Get all clients with filtering and pagination
router.get('/', clientController.getAllClients.bind(clientController));

// Get client statistics
router.get('/stats', clientController.getClientStats.bind(clientController));

// Search clients
router.get('/search', clientController.searchClients.bind(clientController));

// Create new client
router.post('/', clientController.createClient.bind(clientController));

// Get client by ID with related data
router.get('/:clientId', clientController.getClientById.bind(clientController));

// Get client dashboard data
router.get('/:clientId/dashboard', clientController.getClientDashboard.bind(clientController));

// Update client
router.put('/:clientId', clientController.updateClient.bind(clientController));

// Delete client (soft delete)
router.delete('/:clientId', clientController.deleteClient.bind(clientController));

// Hard delete client (admin only)
router.delete('/:clientId/hard', adminMiddleware, clientController.hardDeleteClient.bind(clientController));

// ===== CONTACT ROUTES =====

// Get all contacts for a client
router.get('/:clientId/contacts', contactController.getContactsByClient.bind(contactController));

// Get primary contact for a client
router.get('/:clientId/contacts/primary', contactController.getPrimaryContact.bind(contactController));

// Search contacts for a client
router.get('/:clientId/contacts/search', contactController.searchContacts.bind(contactController));

// Get contacts by type for a client
router.get('/:clientId/contacts/type', contactController.getContactsByType.bind(contactController));

// Create new contact for a client
router.post('/:clientId/contacts', contactController.createContact.bind(contactController));

// Set a contact as primary
router.put('/:clientId/contacts/:contactId/primary', contactController.setPrimaryContact.bind(contactController));

// Get contact by ID
router.get('/contacts/:contactId', contactController.getContactById.bind(contactController));

// Update contact
router.put('/contacts/:contactId', contactController.updateContact.bind(contactController));

// Delete contact
router.delete('/contacts/:contactId', contactController.deleteContact.bind(contactController));

// ===== INTERACTION ROUTES =====

// Get all interactions for a client
router.get('/:clientId/interactions', interactionController.getInteractionsByClient.bind(interactionController));

// Get upcoming interactions for a client
router.get('/:clientId/interactions/upcoming', interactionController.getUpcomingInteractions.bind(interactionController));

// Get overdue interactions for a client
router.get('/:clientId/interactions/overdue', interactionController.getOverdueInteractions.bind(interactionController));

// Get interaction statistics for a client
router.get('/:clientId/interactions/stats', interactionController.getInteractionStats.bind(interactionController));

// Create new interaction for a client
router.post('/:clientId/interactions', interactionController.createInteraction.bind(interactionController));

// Get global upcoming interactions (for dashboard)
router.get('/interactions/upcoming', interactionController.getGlobalUpcomingInteractions.bind(interactionController));

// Get global overdue interactions (for dashboard)
router.get('/interactions/overdue', interactionController.getGlobalOverdueInteractions.bind(interactionController));

// Get interaction by ID
router.get('/interactions/:interactionId', interactionController.getInteractionById.bind(interactionController));

// Update interaction
router.put('/interactions/:interactionId', interactionController.updateInteraction.bind(interactionController));

// Mark interaction as completed
router.put('/interactions/:interactionId/complete', interactionController.markInteractionCompleted.bind(interactionController));

// Delete interaction
router.delete('/interactions/:interactionId', interactionController.deleteInteraction.bind(interactionController));

module.exports = router; 