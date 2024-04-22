class DrawingController < ApplicationController
  def index
    get_parts
  end

  def create
    @drawing = Drawing.new(drawing_params)

    @drawing.save
    render json: { status: 'ok'}
  end

  def destroy
    Drawing.find(params[:id]).destroy
    redirect_to gallery_path
  end

  def randomize
    get_parts
    render json: { 
      body: @body,
      head: @head,
      legs: @legs
    }
  end

  def gallery
    @drawings = Drawing.all
  end

  def part
    @part = Drawing.by_part(params[:part])

    render json: { src: @part.first&.image }
  end

  private

  def get_parts
    @body = Drawing.by_part("body").first&.image
    @head = Drawing.by_part("head").first&.image
    @legs = Drawing.by_part("legs").first&.image
  end

  def drawing_params
    params.require(:drawing).permit(:image, :part)
  end

end
