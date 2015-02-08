<? docfiles.forEach(function(doc) { ?>

<!-- Start <?= doc.filename ?> -->

<? doc.javadoc.forEach(function(comment) { ?>
<? if (!comment.ignore) { ?>
<? if (comment.name) { ?>
<? if (comment.isMethod || comment.isFunction) { ?>
## <?= comment.name ?>(<?= comment.paramStr ?>)
<? } else { ?>
## <?= comment.name ?>
<? } ?>
<? } ?>

<?= comment.description ?>

<? if (comment.deprecated) { ?>
**Deprecated**
<? } ?>

<? if (comment.author) { ?>
Author: <?- comment.author ?>
<? } ?>

<? if (comment.version) { ?>
Version: <?= comment.version ?>
<? } ?>

<? if (comment.see) { ?>
See: <?= comment.see ?>
<? } ?>

<? if (comment.paramTags.length > 0) { ?>
### Params:
<? comment.paramTags.forEach(function(paramTag) { ?>
* **<?= paramTag.joinedTypes ?>** *<?= paramTag.name ?>* <?= paramTag.description ?><? }) ?>
<? } ?>

<? if (comment.returnTags.length > 0) { ?>
### Return:
<? comment.returnTags.forEach(function(returnTag) { ?>
* **<?= returnTag.joinedTypes ?>** <?= returnTag.description ?>
<? }) ?>
<? } ?>
<? } ?>
<? }) ?>

<!-- End <?= doc.filename ?> -->

<? }) ?>