class StyleObject
{
    style: Object;

    constructor()
    {
        this.style =
            {
                fontFamily: "roboto"
            }
    }

    setWidth(width: string | number)
    {
        this.style.width = width;
        return this;
    }

    setHeight(height: string | number)
    {
        this.style.height = height;
        return this;
    }

    setMinHeight(height: string | number)
    {
        this.style.minHeight = height;
        return this;
    }

    setDisplay(display: string)
    {
        this.style.display = display;
        return this;
    }

    setFlexDirection(direction: string)
    {
        this.style.flexDirection = direction;
        return this;
    }

    setFontSize(fontSize: string | number)
    {
        this.style.fontSize = fontSize;
        return this;
    }

    setMargin(margin: string | number)
    {
        this.style.margin = margin;
        return this;
    }

    setMarginBottom(marginBottom: string | number)
    {
        this.style.marginBottom = marginBottom;
        return this;
    }

    setMarginTop(marginTop: string | number)
    {
        this.style.marginTop = marginTop;
        return this;
    }

    setMarginLeft(marginLeft: string | number)
    {
        this.style.marginLeft = marginLeft;
        return this;
    }

    setMarginRight(marginRight: string | number)
    {
        this.style.marginRight = marginRight;
        return this;
    }

    setPadding(padding: string | number)
    {
        this.style.padding = padding;
        return this;
    }

    setPaddingTop(paddingTop: string | number)
    {
        this.style.paddingTop = paddingTop;
        return this;
    }

    setPaddingBottom(paddingBottom: string | number)
    {
        this.style.paddingBottom = paddingBottom;
        return this;
    }

    setBasics(width: string | number, height: string | number, left: string | number, top: string | number)
    {
        this.style.width = width;
        this.style.height = height;
        this.style.left = left;
        this.style.top = top;
        return this;
    }

    setPosition(position: string)
    {
        this.style.position = position;
        return this;
    }

    setTop(top: string | number)
    {
        this.style.top = top;
        return this;
    }

    setBottom(bottom: string | number)
    {
        this.style.bottom = bottom;
        return this;
    }

    setLeft(left: string | number)
    {
        this.style.left = left;
        return this;
    }

    setRight(right: string | number)
    {
        this.style.right = right;
        return this;
    }

    setBorder(border: string)
    {
        this.style.border = border;
        return this;
    }

    setBorderRadius(radius: string | number)
    {
        this.style.borderRadius = radius;
        return this;
    }

    setBorderTop(borderTop: string)
    {
        this.style.borderTop = borderTop;
        return this;
    }

    setBoxShadow(boxShadow: string)
    {
        this.style.boxShadow = boxShadow;
        return this;
    }

    setOverflow(overflow: string)
    {
        this.style.overflow = overflow;
        return this;
    }

    setOverflowX(overflowX: string)
    {
        this.style.overflowX = overflowX;
        return this;
    }

    setOverflowY(overflowY: string)
    {
        this.style.overflowY = overflowY;
        return this;
    }

    setWhiteSpace(whitespace: string)
    {
        this.style.whiteSpace = whitespace;
        return this;
    }

    setTextOverflow(overflow: string)
    {
        this.style.textOverflow = overflow;
        return this;
    }

    setOpacity(opacity: number)
    {
        this.style.opacity = opacity;
        return this;
    }

    setAlignItems(align: string)
    {
        this.style.alignItems = align;
        return this;
    }

    setJustifyContent(justify: string)
    {
        this.style.justifyContent = justify;
        return this;
    }

    setColor(color: string)
    {
        this.style.color = color;
        return this;
    }

    setTransition(property: string, duration: number)
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

    setFill(fill: string)
    {
        this.style.fill = fill;
        return this;
    }

    setStroke(colour: string)
    {
        this.style.stroke = colour;
        return this;
    }

    setCursor(cursor: string)
    {
        this.style.cursor = cursor;
        return this;
    }

    getStyle(): Object
    {
        return this.style;
    }
}

export default StyleObject;