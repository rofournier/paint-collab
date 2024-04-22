class CreateDrawings < ActiveRecord::Migration[7.1]
  def change
    create_table :drawings do |t|
      t.string :part
      t.string :image
      t.timestamps
    end
  end
end
