class Drawing < ApplicationRecord
  scope :by_part, ->(part) { where(part: part).order("RANDOM()").limit(1) }
end
