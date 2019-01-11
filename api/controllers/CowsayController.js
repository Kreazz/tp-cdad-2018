/**
 * CowsayController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var cowsay = require('cowsay');

module.exports = {
  /**
   * `CowsayController.say()`
   */
  say: async function (req, res) {
    let count = await Sentences.count();
    console.debug('Got '+count+' sentences in database');
    let s = await Sentences.find().limit(1).
      skip(Math.floor(Math.random() * Math.floor(count)));
    let sentence = "Random Message";
    if(s.length > 0) {
      sentence = s[0].sentence;
      picture = s[0].picture;
    }
    return res.view('cowsay', { cow: cowsay.say({
      f: process.env.COW || 'stegosaurus',
      picture : picture,
      text : sentence,
      e : 'oO',
      T : 'U '
    })});
  },

  add: async function (req, res) {
    return res.view('add');
  },

uploadFile: function (req, res) {
    req.file('file').upload({
      adapter: require('skipper-better-s3'),
      key: 'AKIAJOCSBD4KTGNIE2YQ',
      secret: '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',
      bucket: 'lp-cdad-2018',
      region: 'eu-west-3',
      s3params: { ACL: 'public-read'},
      onProgress: progress => sails.log.verbose('Upload progress:', progress)
    }, function (err, filesUploaded) {
      if (err) return res.serverError(err);
      return res.ok({
        saved_files: filesUploaded,
        location: filesUploaded[0].extra.Location,
	textParams: req.allParams()
      });
    });
  },

  create:  async function (req, res) {
    await req.file('file').upload({
      adapter: require('skipper-better-s3'),
      key: 'AKIAJOCSBD4KTGNIE2YQ',
      secret: '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',
      bucket: 'lp-cdad-2018',
      region: 'eu-west-3',
      s3params: { ACL: 'public-read'},
      onProgress: progress => sails.log.verbose('Upload progress:', progress)
    }, async function (err, filesUploaded) {
      if (err) return res.serverError(err);
      await Sentences.create({ sentence: req.param('sentence'), picture: filesUploaded[0].extra.Location });
      return res.redirect('/say');
    });

   },
};

