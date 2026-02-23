class StyleObject
{

    constructor()
    {
        this.style =
            {
                fontFamily: "roboto"
            }
    }

    setWidth(width)
    {
        this.style.width = width;
        return this;
    }

    setHeight(height)
    {
        this.style.height = height;
        return this;
    }

    setScale(scale)
    {
        this.style.scale = scale;
        return this;
    }

    setMinHeight(height)
    {
        this.style.minHeight = height;
        return this;
    }

    setDisplay(display)
    {
        this.style.display = display;
        return this;
    }

    setFlexDirection(direction)
    {
        this.style.flexDirection = direction;
        return this;
    }

    setFontSize(fontSize)
    {
        this.style.fontSize = fontSize;
        return this;
    }

    setMargin(margin)
    {
        this.style.margin = margin;
        return this;
    }

    setMarginBottom(marginBottom)
    {
        this.style.marginBottom = marginBottom;
        return this;
    }

    setMarginTop(marginTop)
    {
        this.style.marginTop = marginTop;
        return this;
    }

    setMarginLeft(marginLeft)
    {
        this.style.marginLeft = marginLeft;
        return this;
    }

    setMarginRight(marginRight)
    {
        this.style.marginRight = marginRight;
        return this;
    }

    setPadding(padding)
    {
        this.style.padding = padding;
        return this;
    }

    setPaddingTop(paddingTop)
    {
        this.style.paddingTop = paddingTop;
        return this;
    }

    setPaddingBottom(paddingBottom)
    {
        this.style.paddingBottom = paddingBottom;
        return this;
    }

    setBasics(width, height, left, top)
    {
        this.style.width = width;
        this.style.height = height;
        this.style.left = left;
        this.style.top = top;
        return this;
    }

    setPosition(position)
    {
        this.style.position = position;
        return this;
    }

    setTop(top)
    {
        this.style.top = top;
        return this;
    }

    setBottom(bottom)
    {
        this.style.bottom = bottom;
        return this;
    }

    setLeft(left)
    {
        this.style.left = left;
        return this;
    }

    setRight(right)
    {
        this.style.right = right;
        return this;
    }

    setBorder(border)
    {
        this.style.border = border;
        return this;
    }

    setBorderRadius(radius)
    {
        this.style.borderRadius = radius;
        return this;
    }

    setBorderTop(borderTop)
    {
        this.style.borderTop = borderTop;
        return this;
    }

    setBoxShadow(boxShadow)
    {
        this.style.boxShadow = boxShadow;
        return this;
    }

    setOverflow(overflow)
    {
        this.style.overflow = overflow;
        return this;
    }

    setOverflowX(overflowX)
    {
        this.style.overflowX = overflowX;
        return this;
    }

    setOverflowY(overflowY)
    {
        this.style.overflowY = overflowY;
        return this;
    }

    setWhiteSpace(whitespace)
    {
        this.style.whiteSpace = whitespace;
        return this;
    }

    setTextOverflow(overflow)
    {
        this.style.textOverflow = overflow;
        return this;
    }

    setOpacity(opacity)
    {
        this.style.opacity = opacity;
        return this;
    }

    setAlignItems(align)
    {
        this.style.alignItems = align;
        return this;
    }

    setJustifyContent(justify)
    {
        this.style.justifyContent = justify;
        return this;
    }

    setColor(color)
    {
        this.style.color = color;
        return this;
    }

    setTransition(property, duration)
    {
        if(this.style.transition !== undefined)
        {
            this.style.transition = this.style.transition + ", "  + property + " " + duration + "s";
        }
        else
        {
            this.style.transition = property + " " + duration + "s";
        }
        return this;
    }

    setFill(fill)
    {
        this.style.fill = fill;
        return this;
    }

    setStroke(colour)
    {
        this.style.stroke = colour;
        return this;
    }

    setCursor(cursor)
    {
        this.style.cursor = cursor;
        return this;
    }

    getStyle()
    {
        return this.style;
    }
}

export default StyleObject;
