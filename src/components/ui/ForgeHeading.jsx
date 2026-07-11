import "./ForgeHeading.css"

export default function ForgeHeading({

eyebrow,

title,

subtitle,

center=false

}){

return(

<div className={`forge-heading ${center?"center":""}`}>

{eyebrow &&

<div className="forge-eyebrow">

{eyebrow}

</div>

}

<h2>

{title}

</h2>

{subtitle &&

<p>

{subtitle}

</p>

}

</div>

)

}