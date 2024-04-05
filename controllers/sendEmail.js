const db = require('../db/db');

const sendEmail = async (req, res) => {
    const mailT = db.getMailTransported();

    console.log("got body params ", req.body)
    const {name, email, mobile, lhforce, san, role, deleteReason, created_at, id} = req.body
   
    const info = await mailT.sendMail({
        from: process.env.FROM_EMAIL, // sender address
        to: email, // list of receivers
        subject: "Confirmation: Deletion Request Completed for Your Account", // Subject line
        //text: "Hello world?", // plain text body
        html: `<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LHForce Account Delete Request Form</title>
            <link rel="shortcut icon" href="https://www.labourhomegroup.com/assets/img/favicon.png">
            <link rel="stylesheet" href="https://www.labourhomegroup.com/assets/css/plugins.css">
            <link rel="stylesheet" href="https://www.labourhomegroup.com/assets/css/style.css">
            <link rel="stylesheet" href="https://www.labourhomegroup.com/assets/css/colors/sky.css">
            <link rel="canonical" href="https://www.labourhomegroup.com/">
            <style>
                nav {
                    background-color: #e8e8ff;
                    height: 115px;
                    margin-top: -5px;
                    padding: 20px;
                }
        
                .navbar {
                    width: 100%;
                    z-index: 1020;
                }
        
                img {
                    height: 55px;
                    margin-left: auto;
                    margin-right: auto;
                    display: block;
                }
        
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
        
                h1 {
                    text-align: center;
                }
        
                @media only screen and (max-width: 767px) {
                    nav {
                        height: auto;
                        padding: 10px;
                    }
        
                    img {
                        margin-left: 10px;
                        margin-bottom: 7px;
                    }
                }
            </style>
        </head>
        
        <body>
            <header class="wrapper bg-light pt-1">
                <nav class="navbar navbar-expand-lg classic transparent navbar-light">
                    <div class="container flex-lg-row flex-nowrap align-items-center">
                        <div class="navbar-brand w-100">
                            <a href="index.html">
                                <img src="lhforce_email_logo.png" srcset="lhforce_email_logo.png" alt="">
                            </a>
                        </div>
                    </div>
                </nav>
            </header>
            <div class="container">
                <h1>Confirmation: Deletion Request Initiated</h1>
                <div style="text-align: center;">
                    <p><strong><h1>For your account</h1></strong></p>
                    <span>Date: ${created_at}</span>
                </div>
                <hr style="color: black; margin-top: 11px;">
                <div class="content" style="background-color: rgb(246 246 246);padding: 32px;margin-top: -72px;">
                    <p>Dear ${name}</p>
                    <p>This email confirms that your request to delete your LHForce account and associated data has been
                        Completed. Your privacy and data security are our utmost priorities, and we're committed to ensuring a
                        smooth process for you.</p>
                    <br>
                    <p><strong>Below are the details of your deletion request:</strong></p>
                    <ul>
                        <li><strong>Deletion Request ID:</strong> ${id}</li>
                        <li><strong>Registered Mobile number:</strong> ${mobile}</li>
                        <li><strong>Registered Email ID :</strong> ${email}</li>
                        <li><strong>Deletion Reason:</strong> ${deleteReason}</li>
                        <li><strong>Account Type:</strong> ${lhforce}</li>
                        <li><strong>SAN:</strong> ${san}</li>
                        <li><strong>Role:</strong> ${role}</li>
                    </ul>
                    <br>
                    <p><strong>Please note the following important points:</strong></p>
                    <ul>
                        <li><strong>Account Status:</strong> Your account has been deactivated immediately upon initiation of
                            the deletion process.</li>
                        <li><strong>Data Removal:</strong> All associated data will be permanently removed from our system.
                            Please be aware that this action is irreversible.</li>
                    </ul>
                    <br>
                    <p>We appreciate your trust in LHForce. Should you have any further queries or require assistance, please
                        don't hesitate to contact us at <a href="mailto:support@labourhomeindia.com">support@labourhomeindia.com</a>.</p>
                    <br>
                    <p>Thank you for being a part of our community.</p>
                    <br>
                    <p>Best regards,<br>LHForce Team</p>
                </div>
            </div>
            <footer style="background-color: #e8e8ff;">
                <div class="container py-lg-5 pt-5 pb-5">
                    <div class="row gy-2 gy-lg-0">
                        <div class="col-lg-8 col-md-12">
                            <div class="widget">
                                <p class="mb-0"><u><a href="#">UNSUBSCRIBE</a></u></p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        
            <div class="progress-wrap">
                <svg class="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                    <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
                </svg>
            </div>
            <script src="assets/js/plugins.js"></script>
            <script src="assets/js/theme.js"></script>
            <script src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
        
            <!-- Google Tag Manager (noscript) -->
            <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KTQQVQ8" height="0" width="0"
                    style="display:none;visibility:hidden"></iframe></noscript>
            <!-- End Google Tag Manager (noscript) -->
        
        </body>
        
        </html>`, // html body
      });
    
      console.log("Message sent: %s", info.messageId);
    res.send("Success")
}

module.exports = sendEmail