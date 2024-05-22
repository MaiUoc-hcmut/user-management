const { sequelize } = require('../../config/db');
import { Model, DataTypes, CreationOptional } from 'sequelize';

const ParentCategory = require('./par_category');

class Category extends Model {
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Category.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    id_par_category: {
        type: DataTypes.UUID,
    },
    name: {
        type: DataTypes.STRING(30),
        allowNull: false,
    }

}, {
    sequelize,
    tableName: 'category',
    timestamps: false,
});

Category.belongsTo(ParentCategory, { foreignKey: 'id_par_category' });
ParentCategory.hasMany(Category, { foreignKey: 'id_par_category', as: 'child_categories' });

module.exports = Category
