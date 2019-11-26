const yup = require('yup');
const Tool = require('../models/Tool');

module.exports = {
  async index(req, res) {
    const { tag } = req.query;

    if (tag) {
      const filteredTools = await Tool.find({ tags: tag }).select('-__v');

      return res.json(filteredTools);
    }

    const tools = await Tool.find().select('-__v');

    return res.json(tools);
  },

  async store(req, res) {
    const { title, link, description, tags } = req.body;

    const schema = yup.object().shape({
      title: yup.string().required(),
      link: yup.string().required(),
      description: yup
        .string()
        .min(10)
        .required(),
      tags: yup.array().notRequired(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const ToolExists = await Tool.findOne({ title });

    if (ToolExists) {
      return res.status(401).json({ error: 'Tool already exists' });
    }

    await Tool.create({ title, link, description, tags });

    return res.json({ title, link, description, tags });
  },

  async update(req, res) {
    const schema = yup.object().shape({
      title: yup.string().notRequired(),
      link: yup.string().notRequired(),
      description: yup
        .string()
        .min(10)
        .notRequired(),
      tags: yup.array().notRequired(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { id } = req.params;

    const ToolExists = await Tool.findById(id);

    if (!ToolExists) {
      return res.status(401).json({ error: 'Tool do not exists' });
    }

    const { title, link, description, tags } = req.body;

    const titleInUse = await Tool.findOne({ title });

    if (titleInUse) {
      return res.status(401).json({ error: 'Title in use' });
    }

    await ToolExists.update({ title, link, description, tags });

    return res.json({ id, title, link, description, tags });
  },

  async delete(req, res) {
    const { id } = req.params;

    await Tool.findByIdAndDelete(id);

    return res.send();
  },
};
