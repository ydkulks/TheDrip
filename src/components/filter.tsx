import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Filter } from "lucide-react";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { formatName } from "./utils";
export default function ProductFilter() {
  return(

          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="m-2">
                <Filter /> Filter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Products</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Series Input */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Series:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {prodSpecsData.series.map((seriesItem) => (
                      <div key={seriesItem.series_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`series-${seriesItem.series_id}`}
                          checked={selectedSeries.includes(seriesItem.series_id)}
                          onCheckedChange={() => handleSeriesToggle(seriesItem.series_id)}
                        />
                        <Label htmlFor={`series-${seriesItem.series_id}`} className="text-sm font-normal cursor-pointer">
                          {formatName(seriesItem.seriesName)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Checkboxes */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categories:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {prodSpecsData.categories.map((category) => (
                      <div key={category.categoryId} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.categoryId}`}
                          checked={selectedCategories.includes(category.categoryId)}
                          onCheckedChange={() => handleCategoryToggle(category.categoryId)}
                        />
                        <Label htmlFor={`category-${category.categoryId}`} className="text-sm font-normal cursor-pointer">
                          {formatName(category.categoryName)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>


                {/* Price Range */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Price Range:</Label>

                  <div className="space-y-4 px-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="min-price" className="text-xs">
                          Min: ${minPrice}
                        </Label>
                      </div>
                      <Slider id="min-price" value={[minPrice]} max={100} step={5} onValueChange={handleMinPriceChange} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="max-price" className="text-xs">
                          Max: ${maxPrice}
                        </Label>
                      </div>
                      <Slider id="max-price" value={[maxPrice]} max={100} step={5} onValueChange={handleMaxPriceChange} />
                    </div>
                  </div>
                </div>

                {/* Color Checkboxes */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Colors:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {prodSpecsData.colors.map((color) => (
                      <div key={color.color_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`color-${color.color_id}`}
                          checked={selectedColors.includes(color.color_id)}
                          onCheckedChange={() => handleColorToggle(color.color_id)}
                        />
                        <Label htmlFor={`color-${color.color_id}`} className="text-sm font-normal cursor-pointer">
                          {formatName(color.color_name)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size Checkboxes */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sizes:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {prodSpecsData.sizes.map((size) => (
                      <div key={size.size_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size.size_id}`}
                          checked={selectedSizes.includes(size.size_id)}
                          onCheckedChange={() => handleSizeToggle(size.size_id)}
                        />
                        <Label htmlFor={`size-${size.size_id}`} className="text-sm font-normal cursor-pointer">
                          {formatName(size.size_name)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Stock Filter */}
                <div className="flex text-sm items-center space-x-2 pt-2">
                  <Label className="text-sm font-medium">Stock:</Label>
                  <RadioGroup
                    value={inStock === null ? "null" : inStock.toString()}
                    onValueChange={(value) => handleInStockChange(value === "null" ? null : value === "true")}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="null" id="all" />
                      <Label htmlFor="all">All Products</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="inStock" />
                      <Label htmlFor="inStock">In Stock Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="outOfStock" />
                      <Label htmlFor="outOfStock">Out of Stock Only</Label>
                    </div>
                  </RadioGroup>

                </div>
              </div>

              <DialogFooter className="flex sm:justify-between">
                <Button variant="outline" onClick={handleReset}>
                  Reset Filters
                </Button>
                <Button onClick={handleApply} type="submit">
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  );
}
