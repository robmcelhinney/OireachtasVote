import React from "react";

function Footer() {
	return (
			<footer id="footer" className="text-align-centre">
				<div className="footerCard">
					<h2 className="footerTitle">Contact Me</h2>
					<p className="footerText">
						Contact by email:{" "}
						<a href="mailto:OireachtasVote@robmcelhinney.com">
							OireachtasVote@robmcelhinney.com
						</a>
					</p>
					<p className="footerText">
						Code is on{" "}
						<a
							href="https://github.com/robmcelhinney/OireachtasVote"
							target="_blank"
							rel="noreferrer"
						>
							GitHub
						</a>
					</p>
				</div>
			</footer>
		);
}

export default Footer;
