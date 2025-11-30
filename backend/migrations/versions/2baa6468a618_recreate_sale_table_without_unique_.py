"""Recreate sale table without unique constraint

Revision ID: 2baa6468a618
Revises: 69e058f9db05
Create Date: 2025-11-29 13:52:54.979317

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2baa6468a618'
down_revision = '69e058f9db05'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('sale_temp',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('ticket_id', sa.String(length=50), nullable=False),
        sa.Column('time', sa.DateTime(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('total', sa.Float(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['product.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.execute('INSERT INTO sale_temp SELECT id, ticket_id, time, product_id, quantity, total, notes, employee_id FROM sale')
    op.drop_table('sale')
    op.rename_table('sale_temp', 'sale')

def downgrade():
    op.create_table('sale_temp',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('ticket_id', sa.String(length=50), nullable=False),
        sa.Column('time', sa.DateTime(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('total', sa.Float(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['product.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ticket_id')
    )
    op.execute('INSERT INTO sale_temp SELECT id, ticket_id, time, product_id, quantity, total, notes, employee_id FROM sale')
    op.drop_table('sale')
    op.rename_table('sale_temp', 'sale')
