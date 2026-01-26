// Ejemplo de controlador
export const exampleController = {
  getAll: async (req, res) => {
    try {
      res.json({ message: 'Obteniendo todos los recursos' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ message: `Obteniendo recurso ${id}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      res.status(201).json({ message: 'Recurso creado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ message: `Recurso ${id} actualizado` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ message: `Recurso ${id} eliminado` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
